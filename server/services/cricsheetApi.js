const axios = require('axios');
const zlib = require('zlib');

const DATASETS = {
  ipl: {
    label: 'Indian Premier League',
    url: process.env.CRICSHEET_IPL_ZIP_URL || 'https://cricsheet.org/downloads/ipl_json.zip',
  },
  wpl: {
    label: "Women's Premier League",
    url: process.env.CRICSHEET_WPL_ZIP_URL || 'https://cricsheet.org/downloads/wpl_json.zip',
  },
  tests: {
    label: 'Test matches',
    url: process.env.CRICSHEET_TESTS_ZIP_URL || 'https://cricsheet.org/downloads/tests_json.zip',
  },
  odis: {
    label: 'One Day Internationals',
    url: process.env.CRICSHEET_ODIS_ZIP_URL || 'https://cricsheet.org/downloads/odis_json.zip',
  },
  t20s: {
    label: 'T20 Internationals',
    url: process.env.CRICSHEET_T20S_ZIP_URL || 'https://cricsheet.org/downloads/t20s_json.zip',
  },
};

const datasetCaches = new Map();
const datasetPromises = new Map();

const readUInt16 = (buffer, offset) => buffer.readUInt16LE(offset);
const readUInt32 = (buffer, offset) => buffer.readUInt32LE(offset);

const extractZipEntries = (zipBuffer) => {
  const entries = [];
  let eocdOffset = -1;

  for (let i = zipBuffer.length - 22; i >= 0; i -= 1) {
    if (readUInt32(zipBuffer, i) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }

  if (eocdOffset === -1) {
    throw new Error('Cricsheet ZIP central directory was not found');
  }

  const totalEntries = readUInt16(zipBuffer, eocdOffset + 10);
  const centralDirectoryOffset = readUInt32(zipBuffer, eocdOffset + 16);
  let cursor = centralDirectoryOffset;

  for (let index = 0; index < totalEntries; index += 1) {
    if (readUInt32(zipBuffer, cursor) !== 0x02014b50) break;

    const compressionMethod = readUInt16(zipBuffer, cursor + 10);
    const compressedSize = readUInt32(zipBuffer, cursor + 20);
    const fileNameLength = readUInt16(zipBuffer, cursor + 28);
    const extraLength = readUInt16(zipBuffer, cursor + 30);
    const commentLength = readUInt16(zipBuffer, cursor + 32);
    const localHeaderOffset = readUInt32(zipBuffer, cursor + 42);
    const fileName = zipBuffer.toString('utf8', cursor + 46, cursor + 46 + fileNameLength);

    const localFileNameLength = readUInt16(zipBuffer, localHeaderOffset + 26);
    const localExtraLength = readUInt16(zipBuffer, localHeaderOffset + 28);
    const dataStart = localHeaderOffset + 30 + localFileNameLength + localExtraLength;
    const compressedData = zipBuffer.subarray(dataStart, dataStart + compressedSize);

    if (fileName.endsWith('.json')) {
      entries.push({
        fileName,
        content: (compressionMethod === 8 ? zlib.inflateRawSync(compressedData) : compressedData).toString('utf8'),
      });
    }

    cursor += 46 + fileNameLength + extraLength + commentLength;
  }

  return entries;
};

const normalizeTeam = (team) => {
  const aliases = {
    'Royal Challengers Bangalore': 'Royal Challengers Bengaluru',
    'Delhi Daredevils': 'Delhi Capitals',
    'Kings XI Punjab': 'Punjab Kings',
  };

  return aliases[team] || team;
};

const shortName = (team) => {
  const names = {
    'Royal Challengers Bengaluru': 'RCB',
    'Royal Challengers Bangalore': 'RCB',
    'Gujarat Titans': 'GT',
    'Chennai Super Kings': 'CSK',
    'Mumbai Indians': 'MI',
    'Kolkata Knight Riders': 'KKR',
    'Rajasthan Royals': 'RR',
    'Delhi Capitals': 'DC',
    'Delhi Daredevils': 'DC',
    'Sunrisers Hyderabad': 'SRH',
    'Punjab Kings': 'PBKS',
    'Kings XI Punjab': 'PBKS',
    'Lucknow Super Giants': 'LSG',
    'Deccan Chargers': 'DEC',
    'Pune Warriors': 'PWI',
    'Rising Pune Supergiant': 'RPS',
    'Rising Pune Supergiants': 'RPS',
    'Gujarat Lions': 'GL',
    'Kochi Tuskers Kerala': 'KTK',
  };

  return names[team] || team.split(/\s+/).map((part) => part[0]).join('').slice(0, 4).toUpperCase();
};

const ballsToOvers = (balls) => `${Math.floor(balls / 6)}.${balls % 6}`;

const scoreInning = (inning) => {
  let runs = 0;
  let wickets = 0;
  let legalDeliveries = 0;

  (inning.overs || []).forEach((over) => {
    (over.deliveries || []).forEach((delivery) => {
      runs += Number(delivery.runs?.total || 0);
      wickets += Array.isArray(delivery.wickets) ? delivery.wickets.length : 0;
      const extras = delivery.extras || {};
      if (!extras.wides && !extras.noballs) legalDeliveries += 1;
    });
  });

  return {
    inning: inning.team,
    r: runs,
    w: wickets,
    o: Number(ballsToOvers(legalDeliveries)),
  };
};

const outcomeStatus = (info) => {
  if (info.outcome?.winner) {
    const by = info.outcome.by;
    if (by?.runs) return `${normalizeTeam(info.outcome.winner)} won by ${by.runs} runs`;
    if (by?.wickets) return `${normalizeTeam(info.outcome.winner)} won by ${by.wickets} wickets`;
    return `${normalizeTeam(info.outcome.winner)} won`;
  }

  if (info.outcome?.result) return `Match ${info.outcome.result}`;
  return 'Result unavailable';
};

const wicketText = (wicket) => {
  if (!wicket) return '';
  const fielders = (wicket.fielders || []).map((fielder) => fielder.name).filter(Boolean);
  return `${wicket.player_out} ${wicket.kind}${fielders.length ? ` (${fielders.join(', ')})` : ''}`;
};

const buildScorecard = (innings) => (innings || []).map((inning) => {
  const batting = new Map();
  const bowling = new Map();
  const totals = {
    runs: 0,
    wickets: 0,
    balls: 0,
    extras: 0,
  };

  const ensureBatter = (name) => {
    if (!batting.has(name)) {
      batting.set(name, { name, dismissal: 'not out', r: 0, b: 0, '4s': 0, '6s': 0, sr: '0.00' });
    }
    return batting.get(name);
  };

  const ensureBowler = (name) => {
    if (!bowling.has(name)) {
      bowling.set(name, { name, balls: 0, o: '0.0', m: 0, r: 0, w: 0, nb: 0, wd: 0, eco: '0.00' });
    }
    return bowling.get(name);
  };

  (inning.overs || []).forEach((over) => {
    (over.deliveries || []).forEach((delivery) => {
      const batter = ensureBatter(delivery.batter);
      const bowler = ensureBowler(delivery.bowler);
      const extras = delivery.extras || {};
      const legal = !extras.wides && !extras.noballs;
      const batterRuns = Number(delivery.runs?.batter || 0);
      const totalRuns = Number(delivery.runs?.total || 0);
      const extrasRuns = Number(delivery.runs?.extras || 0);

      totals.runs += totalRuns;
      totals.extras += extrasRuns;
      bowler.r += totalRuns - Number(extras.byes || 0) - Number(extras.legbyes || 0) - Number(extras.penalty || 0);

      batter.r += batterRuns;
      if (legal) {
        batter.b += 1;
        bowler.balls += 1;
        totals.balls += 1;
      }
      if (batterRuns === 4) batter['4s'] += 1;
      if (batterRuns === 6) batter['6s'] += 1;

      if (extras.noballs) bowler.nb += Number(extras.noballs);
      if (extras.wides) bowler.wd += Number(extras.wides);

      (delivery.wickets || []).forEach((wicket) => {
        totals.wickets += 1;
        const dismissed = ensureBatter(wicket.player_out);
        dismissed.dismissal = wicketText(wicket);
        if (!['run out', 'retired hurt', 'retired out', 'obstructing the field'].includes(wicket.kind)) {
          bowler.w += 1;
        }
      });
    });
  });

  const battingRows = Array.from(batting.values()).map((row) => ({
    ...row,
    sr: row.b ? ((row.r / row.b) * 100).toFixed(2) : '0.00',
  }));

  const bowlingRows = Array.from(bowling.values()).map((row) => ({
    ...row,
    o: ballsToOvers(row.balls),
    eco: row.balls ? ((row.r / row.balls) * 6).toFixed(2) : '0.00',
  }));

  return {
    inning: inning.team,
    batting: battingRows,
    bowling: bowlingRows,
    totals: {
      runs: totals.runs,
      wickets: totals.wickets,
      overs: ballsToOvers(totals.balls),
      extras: totals.extras,
    },
  };
});

const buildCommentary = (innings) => {
  const items = [];

  (innings || []).forEach((inning) => {
    (inning.overs || []).forEach((over) => {
      (over.deliveries || []).forEach((delivery, ballIndex) => {
        const extras = delivery.extras || {};
        const event = (delivery.wickets || []).length
          ? 'W'
          : delivery.runs?.batter === 6
            ? '6'
            : delivery.runs?.batter === 4
              ? '4'
              : String(delivery.runs?.total ?? 0);
        const wicket = (delivery.wickets || []).map(wicketText).join('; ');
        const extrasText = Object.entries(extras).map(([key, value]) => `${value} ${key}`).join(', ');

        items.push({
          over: `${over.over}.${ballIndex + 1}`,
          event,
          score: `${delivery.runs?.total ?? 0}`,
          text: `${inning.team}: ${delivery.bowler} to ${delivery.batter}, ${delivery.runs?.total ?? 0} run${delivery.runs?.total === 1 ? '' : 's'}${extrasText ? ` (${extrasText})` : ''}${wicket ? `. Wicket: ${wicket}` : ''}`,
        });
      });
    });
  });

  return items;
};

const buildHighlights = (match) => {
  const highlights = [];
  const info = match.info || {};

  if (info.player_of_match?.length) {
    highlights.push({ title: 'Player of the Match', value: info.player_of_match.join(', ') });
  }
  if (info.outcome?.winner) {
    highlights.push({ title: 'Result', value: outcomeStatus(info) });
  }
  if (info.toss?.winner) {
    highlights.push({ title: 'Toss', value: `${normalizeTeam(info.toss.winner)} chose to ${info.toss.decision}` });
  }

  const wicketCount = (match.innings || []).reduce((count, inning) =>
    count + (inning.overs || []).reduce((inner, over) =>
      inner + (over.deliveries || []).reduce((wickets, delivery) =>
        wickets + (delivery.wickets || []).length, 0), 0), 0);

  const sixes = (match.innings || []).reduce((count, inning) =>
    count + (inning.overs || []).reduce((inner, over) =>
      inner + (over.deliveries || []).filter((delivery) => delivery.runs?.batter === 6).length, 0), 0);

  highlights.push({ title: 'Wickets', value: String(wicketCount) });
  highlights.push({ title: 'Sixes', value: String(sixes) });

  return highlights;
};

const toMatchSummary = (fileName, match, includeDetails = false) => {
  const info = match.info || {};
  const teams = (info.teams || []).map(normalizeTeam);
  const date = Array.isArray(info.dates) ? info.dates[0] : info.dates;
  const eventName = info.event?.name || 'Indian Premier League';
  const playerNames = Object.values(info.players || {}).flat().filter(Boolean);

  const summary = {
    id: `cricsheet-${fileName.replace('.json', '')}`,
    cricsheetFile: fileName,
    source: 'cricsheet',
    name: teams.length >= 2 ? `${teams[0]} vs ${teams[1]}` : eventName,
    series: eventName,
    matchType: info.match_type || 't20',
    status: outcomeStatus(info),
    venue: [info.venue, info.city].filter(Boolean).join(', '),
    date,
    dateTimeGMT: undefined,
    scheduledTime: 'Time unavailable',
    matchStarted: true,
    matchEnded: true,
    teams,
    teamInfo: teams.map((team) => ({ name: team, shortname: shortName(team) })),
    playerNames,
    score: (match.innings || []).map(scoreInning),
    tossWinner: normalizeTeam(info.toss?.winner),
    tossChoice: info.toss?.decision,
    matchWinner: normalizeTeam(info.outcome?.winner),
  };

  if (!includeDetails) return summary;

  const players = info.players || {};
  return {
    ...summary,
    playerOfMatch: info.player_of_match || [],
    umpires: info.officials?.umpires?.join(', '),
    referee: info.officials?.match_referees?.join(', '),
    reserveUmpires: info.officials?.reserve_umpires?.join(', '),
    tvUmpires: info.officials?.tv_umpires?.join(', '),
    squads: Object.entries(players).map(([team, squad]) => ({
      team: normalizeTeam(team),
      players: Array.isArray(squad) ? squad : [],
    })),
    scorecard: buildScorecard(match.innings),
    commentary: buildCommentary(match.innings),
    highlights: buildHighlights(match),
  };
};

const loadDataset = async (key) => {
  if (datasetCaches.has(key)) return datasetCaches.get(key);
  if (datasetPromises.has(key)) return datasetPromises.get(key);

  const dataset = DATASETS[key];
  if (!dataset) {
    throw new Error(`Unknown Cricsheet dataset: ${key}`);
  }

  const promise = axios.get(dataset.url, {
    responseType: 'arraybuffer',
    timeout: 30000,
  }).then((response) => {
    const entries = extractZipEntries(Buffer.from(response.data));
    const summaries = [];
    const detailsById = new Map();
    const rawById = new Map();

    entries.forEach((entry) => {
      const parsed = JSON.parse(entry.content);
      const summary = toMatchSummary(entry.fileName, parsed, false);
      summaries.push(summary);
      rawById.set(summary.id, { fileName: entry.fileName, parsed });
    });

    summaries.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
    const cache = { summaries, detailsById, rawById, label: dataset.label };
    datasetCaches.set(key, cache);
    return cache;
  }).finally(() => {
    datasetPromises.delete(key);
  });

  datasetPromises.set(key, promise);
  return promise;
};

const loadDatasets = async (keys) => Promise.all(keys.map(loadDataset));

const uniqueById = (items) => {
  const map = new Map();
  items.forEach((item) => {
    if (item?.id && !map.has(item.id)) map.set(item.id, item);
  });
  return Array.from(map.values());
};

const normalized = (value) => String(value || '').toLowerCase();

const datasetKeysForQuery = (query) => {
  const q = normalized(query);
  if (q.includes('wpl') || q.includes("women's premier league") || q.includes('women premier league')) return ['wpl'];
  if (q.includes('ashes')) return ['tests'];
  if (q.includes('u19') || q.includes('under-19') || q.includes('under 19')) return ['odis', 't20s'];
  if (q.includes('world cup') || q.includes('icc')) return ['odis', 't20s'];
  if (q.includes('ipl') || q.includes('indian premier league')) return ['ipl'];
  return ['ipl', 'wpl'];
};

const matchText = (match) => normalized([
  match.name,
  match.series,
  match.venue,
  match.status,
  ...(match.teams || []),
  ...(match.teamInfo || []).map((team) => `${team.name || ''} ${team.shortname || ''}`),
  ...(match.playerNames || []),
].join(' '));

const searchMatches = async (query, options = {}) => {
  const keys = datasetKeysForQuery(query);
  const datasets = await loadDatasets(keys);
  const terms = normalized(query)
    .replace(/\bvs\b|\bv\b|versus/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const aliasMap = {
    ipl: ['ipl', 'indian premier league'],
    wpl: ['wpl', "women's premier league", 'women premier league'],
    ashes: ['ashes'],
    icc: ['icc'],
    u19: ['u19', 'under-19', 'under 19'],
    rcb: ['rcb', 'royal challengers bengaluru', 'royal challengers bangalore'],
    gt: ['gt', 'gujarat titans'],
  };

  const year = options.year ? String(options.year) : '';
  const matches = datasets.flatMap((dataset) => dataset.summaries).filter((match) => {
    if (year && !String(match.date || '').startsWith(year)) return false;
    const haystack = matchText(match);
    return terms.every((term) => (aliasMap[term] || [term]).some((candidate) => haystack.includes(candidate)));
  });

  return {
    status: 'success',
    data: uniqueById(matches),
    info: {
      source: 'cricsheet',
      reason: `Loaded real match data from ${datasets.map((dataset) => dataset.label).join(', ')}`,
    },
  };
};

const searchPlayers = async (query) => {
  const keys = datasetKeysForQuery(query);
  const datasets = await loadDatasets(keys);
  const q = normalized(query);
  const players = new Map();

  datasets.forEach((dataset) => {
    dataset.summaries.forEach((match) => {
      (match.playerNames || []).forEach((name) => {
        if (normalized(name).includes(q) && !players.has(name)) {
          players.set(name, {
            id: `cricsheet-player-${encodeURIComponent(name)}`,
            name,
            country: match.series || dataset.label,
          });
        }
      });
    });
  });

  return {
    status: 'success',
    data: Array.from(players.values()).slice(0, 50),
    info: {
      source: 'cricsheet',
      reason: `Loaded player names from ${datasets.map((dataset) => dataset.label).join(', ')}`,
    },
  };
};

const emptyBatting = () => ({ mat: 0, inns: 0, runs: 0, balls: 0, outs: 0, hs: 0, hundreds: 0, fifties: 0, fours: 0, sixes: 0 });
const emptyBowling = () => ({ balls: 0, runs: 0, wickets: 0 });

const addBatting = (row, runs, balls, out, fours, sixes) => {
  row.inns += balls > 0 || runs > 0 || out ? 1 : 0;
  row.runs += runs;
  row.balls += balls;
  row.outs += out ? 1 : 0;
  row.hs = Math.max(row.hs, runs);
  row.hundreds += runs >= 100 ? 1 : 0;
  row.fifties += runs >= 50 && runs < 100 ? 1 : 0;
  row.fours += fours;
  row.sixes += sixes;
};

const statRows = (format, batting, bowling) => {
  const avg = batting.outs ? (batting.runs / batting.outs).toFixed(2) : batting.runs ? 'Not out' : '-';
  const sr = batting.balls ? ((batting.runs / batting.balls) * 100).toFixed(2) : '-';
  const eco = bowling.balls ? ((bowling.runs / bowling.balls) * 6).toFixed(2) : '-';

  return [
    { matchtype: format, stat: 'm', value: batting.mat },
    { matchtype: format, stat: 'inns', value: batting.inns },
    { matchtype: format, stat: 'runs', value: batting.runs },
    { matchtype: format, stat: 'avg', value: avg },
    { matchtype: format, stat: 'sr', value: sr },
    { matchtype: format, stat: '100s', value: batting.hundreds },
    { matchtype: format, stat: '50s', value: batting.fifties },
    { matchtype: format, stat: 'hs', value: batting.hs },
    { matchtype: format, stat: '4s', value: batting.fours },
    { matchtype: format, stat: '6s', value: batting.sixes },
    { matchtype: format, stat: 'wkts', value: bowling.wickets },
    { matchtype: format, stat: 'econ', value: eco },
  ];
};

const playerMatchStats = (match, playerName) => {
  let battingRuns = 0;
  let battingBalls = 0;
  let battingOut = false;
  let fours = 0;
  let sixes = 0;
  let bowlingBalls = 0;
  let bowlingRuns = 0;
  let bowlingWickets = 0;

  (match.innings || []).forEach((inning) => {
    (inning.overs || []).forEach((over) => {
      (over.deliveries || []).forEach((delivery) => {
        const extras = delivery.extras || {};
        const legal = !extras.wides && !extras.noballs;

        if (delivery.batter === playerName) {
          const runs = Number(delivery.runs?.batter || 0);
          battingRuns += runs;
          if (legal) battingBalls += 1;
          if (runs === 4) fours += 1;
          if (runs === 6) sixes += 1;
        }

        if (delivery.bowler === playerName) {
          if (legal) bowlingBalls += 1;
          bowlingRuns += Number(delivery.runs?.total || 0) - Number(extras.byes || 0) - Number(extras.legbyes || 0) - Number(extras.penalty || 0);
        }

        (delivery.wickets || []).forEach((wicket) => {
          if (wicket.player_out === playerName) battingOut = true;
          if (delivery.bowler === playerName && !['run out', 'retired hurt', 'retired out', 'obstructing the field'].includes(wicket.kind)) {
            bowlingWickets += 1;
          }
        });
      });
    });
  });

  return { battingRuns, battingBalls, battingOut, fours, sixes, bowlingBalls, bowlingRuns, bowlingWickets };
};

const getPlayerInfo = async (id) => {
  const prefix = 'cricsheet-player-';
  if (!String(id).startsWith(prefix)) {
    return { status: 'failure', data: null, info: { source: 'cricsheet', reason: 'Not a Cricsheet player id' } };
  }

  const playerName = decodeURIComponent(String(id).slice(prefix.length));
  const datasets = await loadDatasets(['ipl', 'wpl']);
  const battingByFormat = new Map();
  const bowlingByFormat = new Map();
  const yearly = new Map();
  const recentForm = [];
  const awards = [];
  let teams = new Set();
  let latestSeries = '';
  let matchCount = 0;

  datasets.forEach((dataset) => {
    dataset.rawById.forEach(({ parsed, fileName }) => {
      const info = parsed.info || {};
      const allPlayers = Object.values(info.players || {}).flat();
      if (!allPlayers.includes(playerName)) return;

      const summary = toMatchSummary(fileName, parsed, false);
      const format = summary.series || dataset.label;
      const year = String(summary.date || '').slice(0, 4) || 'Unknown';
      const stats = playerMatchStats(parsed, playerName);

      matchCount += 1;
      latestSeries = latestSeries || format;
      (summary.teams || []).forEach((team) => {
        if ((info.players?.[team] || []).includes(playerName)) teams.add(team);
      });

      if (!battingByFormat.has(format)) battingByFormat.set(format, emptyBatting());
      if (!bowlingByFormat.has(format)) bowlingByFormat.set(format, emptyBowling());
      if (!yearly.has(year)) yearly.set(year, { year, ...emptyBatting(), wickets: 0 });

      const batting = battingByFormat.get(format);
      const bowling = bowlingByFormat.get(format);
      const split = yearly.get(year);
      batting.mat += 1;
      addBatting(batting, stats.battingRuns, stats.battingBalls, stats.battingOut, stats.fours, stats.sixes);
      bowling.balls += stats.bowlingBalls;
      bowling.runs += stats.bowlingRuns;
      bowling.wickets += stats.bowlingWickets;

      split.mat += 1;
      addBatting(split, stats.battingRuns, stats.battingBalls, stats.battingOut, stats.fours, stats.sixes);
      split.wickets += stats.bowlingWickets;

      if (recentForm.length < 8) {
        recentForm.push({
          id: summary.id,
          match: summary.name,
          series: summary.series,
          date: summary.date,
          runs: stats.battingRuns,
          balls: stats.battingBalls,
          wickets: stats.bowlingWickets,
          result: summary.status,
        });
      }

      if ((info.player_of_match || []).includes(playerName)) {
        awards.push({
          title: 'Player of the Match',
          match: summary.name,
          date: summary.date,
          series: summary.series,
        });
      }
    });
  });

  const stats = Array.from(battingByFormat.keys()).flatMap((format) =>
    statRows(format, battingByFormat.get(format), bowlingByFormat.get(format) || emptyBowling())
  );

  return {
    status: 'success',
    data: {
      id,
      name: playerName,
      country: latestSeries || 'Cricsheet player',
      role: 'Player',
      teams: Array.from(teams),
      playerImg: '',
      photoSource: 'Cricsheet does not provide player photos.',
      battingStyle: '',
      bowlingStyle: '',
      dateOfBirth: '',
      stats,
      recentForm,
      awards,
      yearlySplits: Array.from(yearly.values()).sort((a, b) => String(b.year).localeCompare(String(a.year))),
      profileSummary: {
        matches: matchCount,
        awards: awards.length,
        dataSource: 'Cricsheet ball-by-ball data',
      },
    },
    info: {
      source: 'cricsheet',
      reason: 'Derived player profile from Cricsheet ball-by-ball data.',
    },
  };
};

const getMatches = async () => {
  const { summaries } = await loadDataset('ipl');
  return {
    status: 'success',
    data: summaries,
    info: {
      source: 'cricsheet',
      reason: 'Loaded all historical IPL match data from Cricsheet',
    },
  };
};

const getMatchInfo = async (id) => {
  let match = null;

  for (const key of Object.keys(DATASETS)) {
    const dataset = await loadDataset(key);
    if (dataset.detailsById.has(id)) {
      match = dataset.detailsById.get(id);
      break;
    }
    if (dataset.rawById.has(id)) {
      const raw = dataset.rawById.get(id);
      match = toMatchSummary(raw.fileName, raw.parsed, true);
      dataset.detailsById.set(id, match);
      break;
    }
  }

  return {
    status: match ? 'success' : 'failure',
    data: match || null,
    info: {
      source: 'cricsheet',
      reason: match ? 'Loaded full real IPL match data from Cricsheet' : 'Match not found in Cricsheet IPL data',
    },
  };
};

const getSeries = async (query = '') => {
  const q = normalized(query);
  if (q.includes('u19') || q.includes('under-19') || q.includes('under 19')) {
    return {
      status: 'success',
      data: [{
        id: 'cricsheet-u19-world-cup',
        name: 'U19 World Cup',
        matches: 0,
        note: 'Cricsheet does not expose U19 World Cup in the lightweight ODI/T20I archives used by this app.',
      }],
      info: {
        source: 'cricsheet',
        reason: 'U19 World Cup filter is available, but match records are not present in the lightweight Cricsheet archives.',
      },
    };
  }

  const keys = datasetKeysForQuery(query);
  const datasets = await loadDatasets(keys);

  return {
    status: 'success',
    data: datasets.map((dataset, index) => ({
      id: `cricsheet-${keys[index]}`,
      name: dataset.label,
      matches: dataset.summaries.length,
    })),
    info: {
      source: 'cricsheet',
      reason: `Loaded series filters from ${datasets.map((dataset) => dataset.label).join(', ')}`,
    },
  };
};

module.exports = {
  getMatches,
  getMatchInfo,
  getSeries,
  searchMatches,
  searchPlayers,
  getPlayerInfo,
};
