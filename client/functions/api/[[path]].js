import { Buffer } from 'node:buffer';
import zlib from 'node:zlib';

const API_BASE_URL = 'https://api.cricapi.com/v1';

const CRICSHEET_DATASETS = {
  ipl: {
    label: 'Indian Premier League',
    url: 'https://cricsheet.org/downloads/ipl_json.zip',
  },
  wpl: {
    label: "Women's Premier League",
    url: 'https://cricsheet.org/downloads/wpl_json.zip',
  },
  tests: {
    label: 'Test matches',
    url: 'https://cricsheet.org/downloads/tests_json.zip',
  },
  odis: {
    label: 'One Day Internationals',
    url: 'https://cricsheet.org/downloads/odis_json.zip',
  },
  t20s: {
    label: 'T20 Internationals',
    url: 'https://cricsheet.org/downloads/t20s_json.zip',
  },
};

const cricsheetCaches = new Map();
const cricsheetPromises = new Map();

const now = Date.now();
const demoMatches = [
  {
    id: 'demo-live-ind-v-aus',
    name: 'India vs Australia, 2nd T20I',
    series: 'International T20 Series',
    matchType: 't20',
    status: 'India need 42 runs from 30 balls',
    venue: 'M. Chinnaswamy Stadium, Bengaluru',
    date: new Date(now).toISOString(),
    dateTimeGMT: new Date(now).toISOString(),
    matchStarted: true,
    matchEnded: false,
    teams: ['India', 'Australia'],
    teamInfo: [
      { name: 'India', shortname: 'IND' },
      { name: 'Australia', shortname: 'AUS' },
    ],
    score: [
      { inning: 'Australia Inning 1', r: 182, w: 6, o: 20 },
      { inning: 'India Inning 1', r: 141, w: 4, o: 15 },
    ],
    tossWinner: 'India',
    tossChoice: 'field',
  },
  {
    id: 'demo-live-eng-v-nz',
    name: 'England Women vs New Zealand Women',
    series: "Women's ODI Championship",
    matchType: 'odi',
    status: 'New Zealand Women are 97/2 after 21 overs',
    venue: "Lord's, London",
    date: new Date(now - 1000 * 60 * 35).toISOString(),
    dateTimeGMT: new Date(now - 1000 * 60 * 35).toISOString(),
    matchStarted: true,
    matchEnded: false,
    teams: ['England Women', 'New Zealand Women'],
    teamInfo: [
      { name: 'England Women', shortname: 'ENG-W' },
      { name: 'New Zealand Women', shortname: 'NZ-W' },
    ],
    score: [
      { inning: 'England Women Inning 1', r: 248, w: 8, o: 50 },
      { inning: 'New Zealand Women Inning 1', r: 97, w: 2, o: 21 },
    ],
  },
  {
    id: 'demo-upcoming-ipl-final',
    name: 'Mumbai Indians vs Chennai Super Kings',
    series: 'IPL 2026',
    matchType: 't20',
    status: 'Match not started',
    venue: 'Wankhede Stadium, Mumbai',
    date: new Date(now + 1000 * 60 * 60 * 26).toISOString(),
    dateTimeGMT: new Date(now + 1000 * 60 * 60 * 26).toISOString(),
    matchStarted: false,
    matchEnded: false,
    teams: ['Mumbai Indians', 'Chennai Super Kings'],
    teamInfo: [
      { name: 'Mumbai Indians', shortname: 'MI' },
      { name: 'Chennai Super Kings', shortname: 'CSK' },
    ],
  },
  {
    id: 'demo-result-pak-v-sa',
    name: 'Pakistan vs South Africa, 1st ODI',
    series: 'ICC Champions Trophy Warm-up',
    matchType: 'odi',
    status: 'Pakistan won by 5 wickets',
    venue: 'Gaddafi Stadium, Lahore',
    date: new Date(now - 1000 * 60 * 60 * 30).toISOString(),
    dateTimeGMT: new Date(now - 1000 * 60 * 60 * 30).toISOString(),
    matchStarted: true,
    matchEnded: true,
    teams: ['Pakistan', 'South Africa'],
    teamInfo: [
      { name: 'Pakistan', shortname: 'PAK' },
      { name: 'South Africa', shortname: 'SA' },
    ],
    score: [
      { inning: 'South Africa Inning 1', r: 264, w: 9, o: 50 },
      { inning: 'Pakistan Inning 1', r: 268, w: 5, o: 48.2 },
    ],
    matchWinner: 'Pakistan',
  },
];

const findDemoMatch = (id) => demoMatches.find((match) => match.id === id);

const json = (data, init = {}) => new Response(JSON.stringify(data), {
  ...init,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    ...(init.headers || {}),
  },
});

const normalized = (value) => String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
const titleCaseName = (value) => String(value || '')
  .trim()
  .split(/\s+/)
  .map((part) => part ? `${part[0].toUpperCase()}${part.slice(1).toLowerCase()}` : part)
  .join(' ');

const formatTerms = new Set(['t20', 't20i', 'odi', 'odis', 'test', 'tests']);

const tournamentArchiveConfig = {
  'icc-world-cup': {
    label: 'ICC Cricket World Cup',
    query: 'ICC Cricket World Cup',
    matchType: 'odi',
    seasons: [
      { year: '2027', totalMatches: 54, winner: 'TBA', host: 'South Africa, Zimbabwe and Namibia', final: 'ICC Cricket World Cup 2027 Final', status: 'Match not started' },
      { year: '2023', totalMatches: 48, winner: 'Australia', host: 'India', final: 'India vs Australia, Final', status: 'Australia won by 6 wickets' },
      { year: '2019', totalMatches: 48, winner: 'England', host: 'England and Wales', final: 'England vs New Zealand, Final', status: 'England won on boundary countback' },
      { year: '2015', totalMatches: 49, winner: 'Australia', host: 'Australia and New Zealand', final: 'Australia vs New Zealand, Final', status: 'Australia won by 7 wickets' },
      { year: '2011', totalMatches: 49, winner: 'India', host: 'India, Sri Lanka and Bangladesh', final: 'India vs Sri Lanka, Final', status: 'India won by 6 wickets' },
      { year: '2007', totalMatches: 51, winner: 'Australia', host: 'West Indies', final: 'Australia vs Sri Lanka, Final', status: 'Australia won by 53 runs' },
      { year: '2003', totalMatches: 54, winner: 'Australia', host: 'South Africa, Zimbabwe and Kenya', final: 'Australia vs India, Final', status: 'Australia won by 125 runs' },
      { year: '1999', totalMatches: 42, winner: 'Australia', host: 'England, Scotland, Ireland, Wales and Netherlands', final: 'Australia vs Pakistan, Final', status: 'Australia won by 8 wickets' },
      { year: '1996', totalMatches: 37, winner: 'Sri Lanka', host: 'India, Pakistan and Sri Lanka', final: 'Sri Lanka vs Australia, Final', status: 'Sri Lanka won by 7 wickets' },
      { year: '1992', totalMatches: 39, winner: 'Pakistan', host: 'Australia and New Zealand', final: 'Pakistan vs England, Final', status: 'Pakistan won by 22 runs' },
      { year: '1987', totalMatches: 27, winner: 'Australia', host: 'India and Pakistan', final: 'Australia vs England, Final', status: 'Australia won by 7 runs' },
      { year: '1983', totalMatches: 27, winner: 'India', host: 'England and Wales', final: 'India vs West Indies, Final', status: 'India won by 43 runs' },
      { year: '1979', totalMatches: 15, winner: 'West Indies', host: 'England', final: 'West Indies vs England, Final', status: 'West Indies won by 92 runs' },
      { year: '1975', totalMatches: 15, winner: 'West Indies', host: 'England', final: 'West Indies vs Australia, Final', status: 'West Indies won by 17 runs' },
    ],
  },
  'the-ashes': {
    label: 'The Ashes',
    query: 'The Ashes',
    matchType: 'test',
    seasons: [
      { year: '2027', totalMatches: 5, winner: 'TBA', host: 'England', final: 'England vs Australia, 5th Test', status: 'Match not started' },
      { year: '2025', totalMatches: 5, winner: 'TBA', host: 'Australia', final: 'Australia vs England, 5th Test', status: 'Match not started' },
      { year: '2023', totalMatches: 5, winner: 'Series drawn 2-2; Australia retained', host: 'England', final: 'England vs Australia, 5th Test', status: 'England won by 49 runs' },
      { year: '2021', totalMatches: 5, winner: 'Australia', host: 'Australia', final: 'Australia vs England, 5th Test', status: 'Australia won by 146 runs' },
      { year: '2019', totalMatches: 5, winner: 'Series drawn 2-2; Australia retained', host: 'England', final: 'England vs Australia, 5th Test', status: 'England won by 135 runs' },
      { year: '2017', totalMatches: 5, winner: 'Australia', host: 'Australia', final: 'Australia vs England, 5th Test', status: 'Australia won by an innings and 123 runs' },
      { year: '2015', totalMatches: 5, winner: 'England', host: 'England', final: 'England vs Australia, 5th Test', status: 'Australia won by an innings and 46 runs' },
    ],
  },
  'u19-world-cup': {
    label: 'ICC U19 Cricket World Cup',
    query: 'ICC U19 Cricket World Cup',
    matchType: 'odi',
    seasons: [
      { year: '2026', totalMatches: 41, winner: 'TBA', host: 'Zimbabwe and Namibia', final: 'ICC U19 Cricket World Cup 2026 Final', status: 'Match not started' },
      { year: '2024', totalMatches: 41, winner: 'Australia U19', host: 'South Africa', final: 'Australia U19 vs India U19, Final', status: 'Australia U19 won by 79 runs' },
      { year: '2022', totalMatches: 48, winner: 'India U19', host: 'West Indies', final: 'India U19 vs England U19, Final', status: 'India U19 won by 4 wickets' },
      { year: '2020', totalMatches: 48, winner: 'Bangladesh U19', host: 'South Africa', final: 'Bangladesh U19 vs India U19, Final', status: 'Bangladesh U19 won by 3 wickets' },
      { year: '2018', totalMatches: 48, winner: 'India U19', host: 'New Zealand', final: 'India U19 vs Australia U19, Final', status: 'India U19 won by 8 wickets' },
      { year: '2016', totalMatches: 48, winner: 'West Indies U19', host: 'Bangladesh', final: 'West Indies U19 vs India U19, Final', status: 'West Indies U19 won by 5 wickets' },
    ],
  },
  'u19-womens-world-cup': {
    label: "ICC Women's U19 T20 World Cup",
    query: "ICC Women's U19 T20 World Cup",
    matchType: 't20',
    seasons: [
      { year: '2027', totalMatches: 41, winner: 'TBA', host: 'Bangladesh and Nepal', final: "ICC Women's U19 T20 World Cup 2027 Final", status: 'Match not started' },
      { year: '2025', totalMatches: 41, winner: 'India U19 Women', host: 'Malaysia', final: 'India U19 Women vs South Africa U19 Women, Final', status: 'India U19 Women won by 9 wickets' },
      { year: '2023', totalMatches: 41, winner: 'India U19 Women', host: 'South Africa', final: 'India U19 Women vs England U19 Women, Final', status: 'India U19 Women won by 7 wickets' },
    ],
  },
};

const archiveTournamentKeyFor = (query, tournament = '') => {
  const q = normalized(`${tournament || ''} ${query || ''}`);
  if (tournamentArchiveConfig[tournament]) return tournament;
  if ((q.includes('women') || q.includes("women's")) && q.includes('u19') && q.includes('world cup')) return 'u19-womens-world-cup';
  if (q.includes('u19') && q.includes('world cup')) return 'u19-world-cup';
  if (q.includes('ashes')) return 'the-ashes';
  if (q.includes('world cup') || q.includes('icc cricket world cup')) return 'icc-world-cup';
  return '';
};

const shortCodeForTeam = (team) => String(team || '')
  .replace(/[^A-Za-z0-9 ]/g, ' ')
  .split(/\s+/)
  .filter(Boolean)
  .map((part) => part[0])
  .join('')
  .slice(0, 5)
  .toUpperCase();

const teamsFromFinal = (final) => {
  const clean = String(final || '')
    .replace(/,\s*Final.*$/i, '')
    .replace(/,\s*\d+(st|nd|rd|th)\s+Test.*$/i, '');
  const teams = clean.split(/\s+vs\s+/i).map((team) => team.trim()).filter(Boolean);
  return teams.length >= 2 ? teams.slice(0, 2) : [];
};

const buildArchiveMatches = (key, config, year = '') => config.seasons
  .filter((season) => !year || season.year === String(year))
  .flatMap((season) => {
    const matchCount = Number(season.totalMatches) || 0;
    const completed = !/match not started|tba/i.test(`${season.status} ${season.winner}`);
    const finalTeams = teamsFromFinal(season.final);

    return Array.from({ length: matchCount }, (_, index) => {
      const matchNumber = index + 1;
      const isFinal = matchNumber === matchCount;
      const isSemiFinal = matchCount > 4 && matchNumber >= matchCount - 2 && matchNumber < matchCount;
      const date = new Date(`${season.year}-01-01T09:00:00.000Z`);
      date.setUTCDate(date.getUTCDate() + index);
      const teams = isFinal && finalTeams.length >= 2
        ? finalTeams
        : [`${config.label} ${season.year} Team ${((index * 2) % 16) + 1}`, `${config.label} ${season.year} Team ${((index * 2 + 1) % 16) + 1}`];

      return {
        id: `${key}-${season.year}-match-${String(matchNumber).padStart(2, '0')}`,
        name: isFinal
          ? season.final
          : `${config.label} ${season.year}, ${isSemiFinal ? `Semi-Final ${matchNumber - (matchCount - 3)}` : `Match ${matchNumber}`}`,
        series: `${config.label} ${season.year}`,
        tournamentKey: key,
        matchType: config.matchType,
        status: isFinal
          ? season.status
          : completed
            ? `${config.label} ${season.year} match ${matchNumber} result archived`
            : 'Match not started',
        venue: season.host,
        date: date.toISOString().slice(0, 10),
        dateTimeGMT: date.toISOString(),
        matchStarted: completed,
        matchEnded: completed,
        teams,
        teamInfo: teams.map((name) => ({ name, shortname: shortCodeForTeam(name) })),
        matchWinner: isFinal && completed ? season.winner : '',
        totalMatches: season.totalMatches,
      };
    });
  });

const findArchiveMatch = (id) => {
  for (const [key, config] of Object.entries(tournamentArchiveConfig)) {
    const match = buildArchiveMatches(key, config).find((item) => item.id === id);
    if (match) return match;
  }
  return null;
};

const buildArchiveSeries = (key, config, year = '') => config.seasons
  .filter((season) => !year || season.year === String(year))
  .map((season) => ({
    id: `${key}-${season.year}-series`,
    name: `${config.label} ${season.year}`,
    seriesName: `${config.label} ${season.year}`,
    tournamentKey: key,
    startDate: `${season.year}-01-01`,
    endDate: `${season.year}-12-31`,
    matches: season.totalMatches,
    winner: season.winner,
    venue: season.host,
  }));

const buildArchiveMetadata = (key, config) => {
  const seasons = config.seasons
    .map(({ year, totalMatches, winner }) => ({ year, totalMatches, winner }))
    .sort((a, b) => Number(a.year) - Number(b.year));
  const years = seasons.map((season) => season.year);

  return {
    key,
    label: config.label,
    query: config.query,
    earliestYear: years[0] || null,
    latestYear: years[years.length - 1] || null,
    years,
    seasons,
  };
};

const searchArchiveTournament = (query, year = '', tournament = '') => {
  const key = archiveTournamentKeyFor(query, tournament);
  if (!key) return null;
  const config = tournamentArchiveConfig[key];

  return {
    matches: buildArchiveMatches(key, config, year),
    series: buildArchiveSeries(key, config, year),
    info: {
      source: 'cloudflare-tournament-archive',
      reason: `Loaded ${config.label} records without fetching oversized Cricsheet archives at the edge.`,
    },
  };
};

const playerQueryTerms = (query) => normalized(query)
  .replace(/[^\p{L}\p{N}\s'-]/gu, ' ')
  .split(/\s+/)
  .filter((term) => term && !formatTerms.has(term));

const cricsheetPlayerIdFor = (scorecardName, displayName = scorecardName) => {
  const base = `cricsheet-player-${encodeURIComponent(scorecardName)}`;
  return displayName && normalized(displayName) !== normalized(scorecardName)
    ? `${base}~alias~${encodeURIComponent(displayName)}`
    : base;
};

const parseCricsheetPlayerId = (id) => {
  const prefix = 'cricsheet-player-';
  const raw = String(id);
  if (!raw.startsWith(prefix)) return null;
  const [scorecardPart, displayPart] = raw.slice(prefix.length).split('~alias~');
  const scorecardName = decodeURIComponent(scorecardPart || '');
  const displayName = displayPart ? decodeURIComponent(displayPart) : scorecardName;
  return { scorecardName, displayName };
};

const playerMatchesQuery = (scorecardName, query) => {
  const name = normalized(scorecardName);
  const terms = playerQueryTerms(query);
  if (!terms.length) return { matches: true, displayName: scorecardName };
  if (name.includes(normalized(query)) || terms.every((term) => name.includes(term))) {
    return { matches: true, displayName: scorecardName };
  }

  if (terms.length >= 2) {
    const surname = terms[terms.length - 1];
    const requestedInitials = terms.slice(0, -1).map((term) => term[0]).join('');
    const nameParts = name.split(/\s+/);
    const scorecardInitials = nameParts.slice(0, -1).join('');
    const scorecardSurname = nameParts[nameParts.length - 1];
    const rawInitialParts = String(scorecardName || '').trim().split(/\s+/).slice(0, -1);
    const isScorecardAbbreviation = rawInitialParts.length > 0 &&
      rawInitialParts.every((part) => part.length <= 3 && part === part.toUpperCase());

    if (
      scorecardSurname === surname &&
      requestedInitials &&
      scorecardInitials &&
      scorecardInitials.startsWith(requestedInitials) &&
      isScorecardAbbreviation
    ) {
      return { matches: true, displayName: titleCaseName(terms.join(' ')) };
    }
  }

  return { matches: false, displayName: scorecardName };
};

const termsFor = (value) => normalized(value)
  .replace(/\bvs\b|\bv\b|versus/g, ' ')
  .split(/\s+/)
  .filter((term) => term && !['the', 'and', 'of'].includes(term));

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

  return names[team] || String(team || '')
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 4)
    .toUpperCase();
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
    const winner = normalizeTeam(info.outcome.winner);
    const by = info.outcome.by;
    if (by?.runs) return `${winner} won by ${by.runs} runs`;
    if (by?.wickets) return `${winner} won by ${by.wickets} wickets`;
    return `${winner} won`;
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
  const totals = { runs: 0, wickets: 0, balls: 0, extras: 0 };

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

  return {
    inning: inning.team,
    batting: Array.from(batting.values()).map((row) => ({
      ...row,
      sr: row.b ? ((row.r / row.b) * 100).toFixed(2) : '0.00',
    })),
    bowling: Array.from(bowling.values()).map((row) => ({
      ...row,
      o: ballsToOvers(row.balls),
      eco: row.balls ? ((row.r / row.balls) * 6).toFixed(2) : '0.00',
    })),
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
  const info = match.info || {};
  const highlights = [];

  if (info.player_of_match?.length) highlights.push({ title: 'Player of the Match', value: info.player_of_match.join(', ') });
  if (info.outcome?.winner) highlights.push({ title: 'Result', value: outcomeStatus(info) });
  if (info.toss?.winner) highlights.push({ title: 'Toss', value: `${normalizeTeam(info.toss.winner)} chose to ${info.toss.decision}` });

  return highlights;
};

const toCricsheetSummary = (fileName, match, includeDetails = false) => {
  const info = match.info || {};
  const teams = (info.teams || []).map(normalizeTeam);
  const date = Array.isArray(info.dates) ? info.dates[0] : info.dates;
  const eventName = info.event?.name || 'Cricket';
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
    scheduledTime: 'Time unavailable',
    matchStarted: true,
    matchEnded: true,
    teams,
    teamInfo: teams.map((team) => ({ name: team, shortname: shortName(team) })),
    playerNames,
    score: (match.innings || []).map(scoreInning),
    tossWinner: info.toss?.winner ? normalizeTeam(info.toss.winner) : undefined,
    tossChoice: info.toss?.decision,
    matchWinner: info.outcome?.winner ? normalizeTeam(info.outcome.winner) : undefined,
  };

  if (!includeDetails) return summary;

  return {
    ...summary,
    playerOfMatch: info.player_of_match || [],
    umpires: info.officials?.umpires?.join(', '),
    referee: info.officials?.match_referees?.join(', '),
    squads: Object.entries(info.players || {}).map(([team, squad]) => ({
      team: normalizeTeam(team),
      players: Array.isArray(squad) ? squad : [],
    })),
    scorecard: buildScorecard(match.innings),
    commentary: buildCommentary(match.innings),
    highlights: buildHighlights(match),
  };
};

const loadCricsheetDataset = async (key) => {
  if (cricsheetCaches.has(key)) return cricsheetCaches.get(key);
  if (cricsheetPromises.has(key)) return cricsheetPromises.get(key);

  const dataset = CRICSHEET_DATASETS[key];
  if (!dataset) throw new Error(`Unknown Cricsheet dataset: ${key}`);

  const promise = fetch(dataset.url, {
    headers: { accept: 'application/zip, application/octet-stream' },
    cf: { cacheTtl: 86400, cacheEverything: true },
  }).then(async (response) => {
    if (!response.ok) throw new Error(`Cricsheet download failed: ${response.status}`);

    const zipBuffer = Buffer.from(await response.arrayBuffer());
    const entries = extractZipEntries(zipBuffer);
    const summaries = [];
    const detailsById = new Map();
    const rawById = new Map();

    entries.forEach((entry) => {
      const parsed = JSON.parse(entry.content);
      const summary = toCricsheetSummary(entry.fileName, parsed, false);
      summaries.push(summary);
      rawById.set(summary.id, { fileName: entry.fileName, parsed });
    });

    summaries.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
    const cache = { summaries, detailsById, rawById, label: dataset.label };
    cricsheetCaches.set(key, cache);
    return cache;
  }).finally(() => {
    cricsheetPromises.delete(key);
  });

  cricsheetPromises.set(key, promise);
  return promise;
};

const loadCricsheetDatasets = async (keys) => Promise.all(keys.map(loadCricsheetDataset));

const uniqueById = (items) => {
  const map = new Map();
  items.forEach((item) => {
    const key = item?.id || item?.name;
    if (key && !map.has(key)) map.set(key, item);
  });
  return Array.from(map.values());
};

const hasUsableData = (payload) => {
  const data = payload?.data;
  if (Array.isArray(data)) return data.length > 0;
  return Boolean(data && typeof data === 'object');
};

const scoreSummaryToScorecard = (score = []) => score.map((inning) => ({
  inning: inning.inning || 'Innings',
  batting: [],
  bowling: [],
  totals: {
    runs: inning.r ?? 0,
    wickets: inning.w ?? 0,
    overs: inning.o ?? '-',
    extras: 0,
  },
}));

const localMatchInfo = (match) => ({
  ...match,
  scheduledTime: match.scheduledTime || match.dateTimeGMT || 'Time unavailable',
  squads: match.squads || (match.teams || []).map((team) => ({
    team,
    players: ['Squad details unavailable'],
  })),
  highlights: match.highlights || [
    ...(match.status ? [{ title: 'Status', value: match.status }] : []),
    ...(match.matchWinner ? [{ title: 'Winner', value: match.matchWinner }] : []),
  ],
});

const localScorecard = (match) => ({
  ...match,
  scorecard: Array.isArray(match.scorecard) && match.scorecard.length
    ? match.scorecard
    : scoreSummaryToScorecard(match.score || []),
  commentary: match.commentary || [],
  highlights: match.highlights || [
    ...(match.status ? [{ title: 'Status', value: match.status }] : []),
    ...(match.matchWinner ? [{ title: 'Winner', value: match.matchWinner }] : []),
  ],
});

const matchText = (match) => normalized([
  match?.name,
  match?.series,
  match?.matchType,
  match?.venue,
  match?.status,
  match?.country,
  match?.role,
  ...(match?.teams || []),
  ...(match?.playerNames || []),
  ...(match?.teamInfo || []).map((team) => `${team.name || ''} ${team.shortname || ''}`),
].join(' '));

const recentKeysForTournament = (tournament = 'all') => {
  if (tournament === 'ipl') return ['ipl'];
  if (tournament === 'wpl') return ['wpl'];
  if (tournament === 'the-ashes') return ['tests'];
  if (tournament === 'icc-world-cup') return ['odis'];
  if (tournament === 'u19-womens-world-cup') return ['t20s'];
  if (tournament === 'u19-world-cup') return ['odis', 't20s'];
  if (tournament === 'other') return ['tests', 'odis', 't20s'];
  return ['ipl', 'wpl'];
};

const matchesRecentTournament = (match, tournament = 'all') => {
  if (!tournament || tournament === 'all') return true;
  const text = matchText(match);
  const isIpl = text.includes('indian premier league') || /\bipl\b/.test(text);
  const isWpl = text.includes("women's premier league") || text.includes('women premier league') || /\bwpl\b/.test(text);
  const isAshes = text.includes('ashes');
  const isU19 = text.includes('u19') || text.includes('under-19') || text.includes('under 19');
  const isWomen = text.includes('women');
  const isWorldCup = text.includes('world cup');
  const isQualifierOrLeague = text.includes('qualifier') || text.includes('league');

  if (tournament === 'ipl') return isIpl;
  if (tournament === 'wpl') return isWpl;
  if (tournament === 'the-ashes') return isAshes;
  if (tournament === 'icc-world-cup') return isWorldCup && !isU19 && !isWomen && !isQualifierOrLeague;
  if (tournament === 'u19-womens-world-cup') return isWorldCup && isU19 && isWomen;
  if (tournament === 'u19-world-cup') return isWorldCup && isU19 && !isWomen;
  if (tournament === 'other') return !isIpl && !isWpl && !isAshes && !(isWorldCup && !isU19) && !(isWorldCup && isU19);

  return true;
};

const isCompletedMatch = (match) =>
  match?.matchEnded === true ||
  Boolean(match?.matchWinner) ||
  /\b(won|drawn|tied|tie|no result|abandoned|completed)\b/i.test(match?.status || '');

const isUpcomingMatch = (match) => {
  const startsAt = new Date(match?.dateTimeGMT || match?.date || '').getTime();
  return match?.matchEnded !== true && (
    match?.matchStarted === false ||
    /not started|scheduled|fixture|upcoming/i.test(match?.status || '') ||
    (Number.isFinite(startsAt) && startsAt > Date.now())
  );
};

const isLiveMatch = (match) =>
  match?.matchEnded !== true &&
  !isCompletedMatch(match) &&
  !isUpcomingMatch(match) &&
  (
    match?.matchStarted === true ||
    /\b(live|need|require|required|after \d|trail|lead|stumps|innings)\b/i.test(match?.status || '')
  );

const hasResultCardData = (match) =>
  isCompletedMatch(match) &&
  (match?.teams || []).length >= 2 &&
  (
    (match?.score || []).length > 0 ||
    Boolean(match?.status) ||
    Boolean(match?.matchWinner)
  );

const aliasCandidates = (term) => {
  const aliases = {
    ipl: ['ipl', 'indian premier league'],
    wpl: ['wpl', "women's premier league", 'women premier league'],
    ashes: ['ashes'],
    u19: ['u19', 'under-19', 'under 19', 'under-19s', 'under 19s'],
    womens: ['women', "women's", 'womens'],
    women: ['women', "women's", 'womens'],
    rcb: ['rcb', 'royal challengers bengaluru', 'royal challengers bangalore'],
    gt: ['gt', 'gujarat titans'],
    csk: ['csk', 'chennai super kings'],
    mi: ['mi', 'mumbai indians'],
    kkr: ['kkr', 'kolkata knight riders'],
    rr: ['rr', 'rajasthan royals'],
    dc: ['dc', 'delhi capitals', 'delhi daredevils'],
    pbks: ['pbks', 'punjab kings', 'kings xi punjab'],
  };

  return aliases[term] || [term];
};

const includesQuery = (item, query) => {
  const terms = termsFor(query);
  if (!terms.length) return true;
  const haystack = matchText(item);
  return terms.every((term) => aliasCandidates(term).some((candidate) => haystack.includes(candidate)));
};

const includesPlayerQuery = (item, query) => {
  const terms = playerQueryTerms(query);
  if (!terms.length) return true;
  const haystack = matchText(item);
  return terms.every((term) => haystack.includes(term));
};

const tournamentLabelFor = (tournament, query) => {
  const q = normalized(`${tournament || ''} ${query || ''}`);
  if (tournament === 'ipl' || q.includes('ipl') || q.includes('indian premier league')) return 'IPL';
  if (tournament === 'wpl' || q.includes('wpl') || q.includes("women's premier league")) return 'WPL';
  if (tournament === 'the-ashes' || q.includes('ashes')) return 'The Ashes';
  if (tournament === 'icc-world-cup' || q.includes('world cup')) return 'ICC Cricket World Cup';
  if (tournament === 'u19-womens-world-cup') return "ICC Women's U19 T20 World Cup";
  if (tournament === 'u19-world-cup' || q.includes('u19')) return 'ICC U19 Cricket World Cup';
  return '';
};

const cricsheetKeysFor = (query, tournament = '') => {
  if (tournament === 'ipl') return ['ipl'];
  if (tournament === 'wpl') return ['wpl'];
  if (tournament === 'the-ashes') return ['tests'];
  if (tournament === 'icc-world-cup') return ['odis'];
  if (tournament === 'u19-world-cup') return ['odis', 't20s'];
  if (tournament === 'u19-womens-world-cup') return ['t20s'];

  const q = normalized(query);
  if (q.includes('wpl') || q.includes("women's premier league") || q.includes('women premier league')) return ['wpl'];
  if (q.includes('ashes')) return ['tests'];
  if (q.includes('u19') || q.includes('under-19') || q.includes('under 19')) return ['odis', 't20s'];
  if (q.includes('world cup') || q.includes('icc')) return ['odis', 't20s'];
  if (q.includes('ipl') || q.includes('indian premier league')) return ['ipl'];
  return ['ipl', 'wpl'];
};

const searchCricsheetMatches = async (query, options = {}) => {
  const keys = cricsheetKeysFor(query, options.tournament);
  const tournamentLabel = tournamentLabelFor(options.tournament, query);
  const datasets = await loadCricsheetDatasets(keys);
  const year = options.year ? String(options.year) : '';
  const queryForFilter = tournamentLabel || query;
  const matches = datasets.flatMap((dataset) => dataset.summaries).filter((match) => {
    if (year && !String(match.date || '').startsWith(year)) return false;
    return includesQuery(match, queryForFilter) || (!tournamentLabel && includesQuery(match, query));
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

const getRecentCricsheetMatches = async (limit = 20, tournament = 'all') => {
  const datasets = await loadCricsheetDatasets(recentKeysForTournament(tournament));
  const matches = uniqueById(datasets.flatMap((dataset) => dataset.summaries))
    .filter((match) =>
      match.matchEnded === true &&
      (match.teams || []).length >= 2 &&
      (match.score || []).length > 0 &&
      matchesRecentTournament(match, tournament)
    )
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
    .slice(0, limit);

  return {
    status: 'success',
    data: matches,
    info: {
      source: 'cricsheet',
      reason: 'Loaded recent completed matches from IPL, WPL, Tests, ODIs, and T20 internationals.',
    },
  };
};

const searchCricsheetPlayers = async (query) => {
  const datasets = await loadCricsheetDatasets(cricsheetKeysFor(query));
  const players = new Map();

  datasets.forEach((dataset) => {
    dataset.summaries.forEach((match) => {
      (match.playerNames || []).forEach((name) => {
        const matchResult = playerMatchesQuery(name, query);
        if (matchResult.matches && !players.has(name)) {
          players.set(name, {
            id: cricsheetPlayerIdFor(name, matchResult.displayName),
            name: matchResult.displayName,
            scorecardName: name,
            country: match.series || dataset.label,
          });
        }
      });
    });
  });

  return {
    status: 'success',
    data: Array.from(players.values()),
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

const getCricsheetPlayerInfo = async (id) => {
  const parsedId = parseCricsheetPlayerId(id);
  if (!parsedId) return null;

  const playerName = parsedId.scorecardName;
  const displayName = parsedId.displayName || playerName;
  const datasets = await loadCricsheetDatasets(['ipl', 'wpl']);
  const battingByFormat = new Map();
  const bowlingByFormat = new Map();
  const yearly = new Map();
  const recentForm = [];
  const awards = [];
  const teams = new Set();
  let latestSeries = '';
  let matchCount = 0;

  datasets.forEach((dataset) => {
    dataset.rawById.forEach(({ parsed, fileName }) => {
      const info = parsed.info || {};
      const allPlayers = Object.values(info.players || {}).flat();
      if (!allPlayers.includes(playerName)) return;

      const summary = toCricsheetSummary(fileName, parsed, false);
      const format = summary.series || dataset.label;
      const year = String(summary.date || '').slice(0, 4) || 'Unknown';
      const stats = playerMatchStats(parsed, playerName);

      matchCount += 1;
      latestSeries = latestSeries || format;
      Object.entries(info.players || {}).forEach(([team, squad]) => {
        if (Array.isArray(squad) && squad.includes(playerName)) teams.add(normalizeTeam(team));
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
    id,
    name: displayName,
    scorecardName: playerName,
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
  };
};

const getCricsheetMatch = async (id) => {
  for (const key of Object.keys(CRICSHEET_DATASETS)) {
    const dataset = await loadCricsheetDataset(key);
    if (dataset.detailsById.has(id)) return dataset.detailsById.get(id);
    if (dataset.rawById.has(id)) {
      const raw = dataset.rawById.get(id);
      const match = toCricsheetSummary(raw.fileName, raw.parsed, true);
      dataset.detailsById.set(id, match);
      return match;
    }
  }
  return null;
};

const buildCricsheetMetadata = async (key, label, query) => {
  const dataset = await loadCricsheetDataset(key);
  const byYear = new Map();

  dataset.summaries.forEach((match) => {
    const year = String(match.date || '').slice(0, 4);
    if (!/^\d{4}$/.test(year)) return;
    if (!byYear.has(year)) {
      byYear.set(year, { year, totalMatches: 0, winner: '', latestDate: '' });
    }
    const season = byYear.get(year);
    season.totalMatches += 1;
    if (match.matchWinner && (!season.latestDate || String(match.date || '') > season.latestDate)) {
      season.winner = match.matchWinner;
      season.latestDate = match.date || season.latestDate;
    }
  });

  const seasons = Array.from(byYear.values())
    .sort((a, b) => Number(a.year) - Number(b.year))
    .map(({ year, totalMatches, winner }) => ({
      year,
      totalMatches,
      winner: winner || 'Winner unavailable from data source',
    }));
  const years = seasons.map((season) => season.year);

  return {
    key,
    label,
    query,
    earliestYear: years[0] || null,
    latestYear: years[years.length - 1] || null,
    years,
    seasons,
  };
};

const emptyMetadata = (key, label, query) => ({
  key,
  label,
  query,
  earliestYear: null,
  latestYear: null,
  years: [],
  seasons: [],
});

const searchMetadata = async () => {
  const [ipl, wpl] = await Promise.all([
    buildCricsheetMetadata('ipl', 'IPL', 'IPL').catch(() => emptyMetadata('ipl', 'IPL', 'IPL')),
    buildCricsheetMetadata('wpl', 'WPL', 'WPL').catch(() => emptyMetadata('wpl', 'WPL', 'WPL')),
  ]);

  return [
    ipl,
    buildArchiveMetadata('icc-world-cup', tournamentArchiveConfig['icc-world-cup']),
    buildArchiveMetadata('the-ashes', tournamentArchiveConfig['the-ashes']),
    wpl,
    buildArchiveMetadata('u19-womens-world-cup', tournamentArchiveConfig['u19-womens-world-cup']),
    buildArchiveMetadata('u19-world-cup', tournamentArchiveConfig['u19-world-cup']),
  ];
};

const providerRequest = async (env, endpoint, params = {}) => {
  const apiKey = env.CRIC_API_KEY;
  if (!apiKey) {
    return {
      status: 'failure',
      data: [],
      info: {
        source: 'cricapi',
        reason: 'CRIC_API_KEY is missing. Add it in Cloudflare Pages environment variables.',
      },
    };
  }

  const url = new URL(`${API_BASE_URL}/${endpoint}`);
  url.searchParams.set('apikey', apiKey);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url.toString(), { headers: { accept: 'application/json' } });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.status === 'failure') {
    return {
      status: 'failure',
      data: [],
      info: {
        ...(payload.info || {}),
        source: 'cricapi',
        endpoint,
        reason: payload.reason || payload.message || payload.info?.reason || `Provider request failed: ${response.status}`,
      },
    };
  }

  return {
    status: payload.status || 'success',
    data: Array.isArray(payload.data) || payload.data ? payload.data : [],
    info: {
      ...(payload.info || {}),
      source: 'cricapi',
      endpoint,
    },
  };
};

const providerRequestPages = async (env, endpoint, params = {}, { pageSize = 25, maxPages = 12 } = {}) => {
  const pages = [];
  let info = {};

  for (let page = 0; page < maxPages; page += 1) {
    const offset = page * pageSize;
    const payload = await providerRequest(env, endpoint, { ...params, offset });
    info = { ...info, ...(payload.info || {}) };
    if (payload.status === 'failure' || payload.status === 'error') {
      return { status: 'success', data: pages, info: { ...info, source: 'cricapi', reason: payload.info?.reason || 'Provider returned an error' } };
    }

    const data = Array.isArray(payload.data) ? payload.data : [];
    pages.push(...data);

    const totalRows = Number(payload.info?.totalRows || payload.info?.total || payload.totalRows || 0);
    if (data.length < pageSize || (totalRows && pages.length >= totalRows)) break;
  }

  return {
    status: 'success',
    data: pages,
    info: { ...info, source: 'cricapi', endpoint },
  };
};

const getProviderMatches = async (env) => {
  const [current, scheduled] = await Promise.all([
    providerRequestPages(env, 'currentMatches'),
    providerRequestPages(env, 'matches'),
  ]);

  return {
    status: 'success',
    data: uniqueById([
      ...(Array.isArray(current.data) ? current.data : []),
      ...(Array.isArray(scheduled.data) ? scheduled.data : []),
    ]),
    info: {
      source: 'cricapi',
      current: current.info,
      scheduled: scheduled.info,
    },
  };
};

const searchProviderPlayers = async (env, query) => {
  const players = await providerRequestPages(env, 'players', { search: query });
  return {
    ...players,
    data: (Array.isArray(players.data) ? players.data : []).filter((player) => includesPlayerQuery(player, query)),
  };
};

const searchProviderSeries = async (env, query) => {
  const series = await providerRequestPages(env, 'series', { search: query });
  return {
    ...series,
    data: (Array.isArray(series.data) ? series.data : []).filter((item) => includesQuery(item, query)),
  };
};

const isTournamentSearch = (query, tournament) => {
  if (tournament) return true;
  const q = normalized(query);
  return ['ipl', 'wpl', 'world cup', 'ashes', 'u19', 'indian premier league', "women's premier league"]
    .some((term) => q.includes(term));
};

export async function onRequest(context) {
  const { request, env, params } = context;
  const url = new URL(request.url);
  const path = Array.isArray(params.path) ? params.path : String(params.path || '').split('/').filter(Boolean);

  try {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204 });

    if (path.length === 0 || path[0] === 'health') {
      return json({
        status: 'success',
        server: 'cloudflare-pages-functions',
        cricketApiKeyConfigured: Boolean(env.CRIC_API_KEY),
        cricsheetEnabled: true,
      });
    }

    if (path[0] === 'matches' && path[1] === 'series') {
      const query = url.searchParams.get('search') || '';
      const provider = await searchProviderSeries(env, query || 'cricket');
      const cricsheet = await Promise.all([
        loadCricsheetDataset('ipl').catch(() => null),
        loadCricsheetDataset('wpl').catch(() => null),
      ]);
      const cricsheetSeries = cricsheet.filter(Boolean).map((dataset, index) => ({
        id: `cricsheet-${index === 0 ? 'ipl' : 'wpl'}`,
        name: dataset.label,
        matches: dataset.summaries.length,
      }));
      return json({
        status: 'success',
        data: uniqueById([...(Array.isArray(provider.data) ? provider.data : []), ...cricsheetSeries]),
        info: { provider: provider.info, source: 'cricapi+cricsheet' },
      });
    }

    if (path[0] === 'matches' && path[1] && path[2] === 'scorecard') {
      const id = decodeURIComponent(path[1]);
      if (id.startsWith('cricsheet-')) {
        const match = await getCricsheetMatch(id);
        return json({
          status: match ? 'success' : 'failure',
          data: match,
          info: { source: 'cricsheet', reason: match ? 'Loaded real scorecard from Cricsheet' : 'Match not found in Cricsheet data' },
        }, match ? {} : { status: 404 });
      }

      const demoMatch = findDemoMatch(id);
      if (demoMatch) {
        return json({
          status: 'success',
          data: localScorecard(demoMatch),
          info: { source: 'local-scorecard-fallback', reason: 'Loaded local score summary because provider scorecard data is unavailable.' },
        });
      }

      const archiveMatch = findArchiveMatch(id);
      if (archiveMatch) {
        return json({
          status: 'success',
          data: localScorecard(archiveMatch),
          info: { source: 'cloudflare-tournament-archive', reason: 'Loaded tournament archive scorecard summary.' },
        });
      }

      const data = await providerRequest(env, 'match_scorecard', { id });
      if (!hasUsableData(data)) {
        return json({
          status: 'failure',
          data: null,
          info: { ...(data.info || {}), reason: data.info?.reason || 'Match scorecard not found.' },
        }, { status: 404 });
      }
      return json({ status: data.status, data: data.data, info: data.info });
    }

    if (path[0] === 'matches' && path[1]) {
      const id = decodeURIComponent(path[1]);
      if (id.startsWith('cricsheet-')) {
        const match = await getCricsheetMatch(id);
        return json({
          status: match ? 'success' : 'failure',
          data: match,
          info: { source: 'cricsheet', reason: match ? 'Loaded real match data from Cricsheet' : 'Match not found in Cricsheet data' },
        }, match ? {} : { status: 404 });
      }

      const demoMatch = findDemoMatch(id);
      if (demoMatch) {
        return json({
          status: 'success',
          data: localMatchInfo(demoMatch),
          info: { source: 'local-match-fallback', reason: 'Loaded local match detail because provider score data is unavailable.' },
        });
      }

      const archiveMatch = findArchiveMatch(id);
      if (archiveMatch) {
        return json({
          status: 'success',
          data: localMatchInfo(archiveMatch),
          info: { source: 'cloudflare-tournament-archive', reason: 'Loaded tournament archive match detail.' },
        });
      }

      const data = await providerRequest(env, 'match_info', { id });
      if (!hasUsableData(data)) {
        return json({
          status: 'failure',
          data: null,
          info: { ...(data.info || {}), reason: data.info?.reason || 'Match not found.' },
        }, { status: 404 });
      }
      return json({ status: data.status, data: data.data, info: data.info });
    }

    if (path[0] === 'matches') {
      const feed = url.searchParams.get('feed') || '';
      if (feed === 'live') {
        const provider = await providerRequestPages(env, 'currentMatches').catch(() => ({ data: [], info: {} }));
        const matches = (Array.isArray(provider.data) ? provider.data : [])
          .filter(isLiveMatch);
        return json({
          status: 'success',
          data: matches,
          info: { provider: provider.info, source: 'provider-live' },
        });
      }

      if (feed === 'upcoming') {
        const provider = await providerRequestPages(env, 'matches').catch(() => ({ data: [], info: {} }));
        const matches = (Array.isArray(provider.data) ? provider.data : [])
          .filter(isUpcomingMatch);
        return json({
          status: 'success',
          data: matches,
          info: { provider: provider.info, source: 'provider-upcoming' },
        });
      }

      if (feed === 'recent') {
        const tournament = url.searchParams.get('tournament') || 'all';
        const [current, scheduled, cricsheetRecent] = await Promise.all([
          providerRequestPages(env, 'currentMatches').catch(() => ({ data: [], info: {} })),
          providerRequestPages(env, 'matches').catch(() => ({ data: [], info: {} })),
          getRecentCricsheetMatches(50, tournament).catch((error) => ({ data: [], info: { source: 'cricsheet', reason: error.message } })),
        ]);
        const matches = uniqueById([
          ...(Array.isArray(current.data) ? current.data : []),
          ...(Array.isArray(scheduled.data) ? scheduled.data : []),
          ...(Array.isArray(cricsheetRecent.data) ? cricsheetRecent.data : []),
        ])
          .filter((match) => hasResultCardData(match) && matchesRecentTournament(match, tournament))
          .sort((a, b) => new Date(b.dateTimeGMT || b.date || 0).getTime() - new Date(a.dateTimeGMT || a.date || 0).getTime());
        return json({
          status: 'success',
          data: matches,
          info: { current: current.info, scheduled: scheduled.info, cricsheet: cricsheetRecent.info, source: 'provider+cricsheet-recent' },
        });
      }

      const provider = await getProviderMatches(env).catch(() => ({ data: [], info: {} }));
      return json({
        status: 'success',
        data: Array.isArray(provider.data) ? provider.data : [],
        info: { provider: provider.info, source: 'provider' },
      });
    }

    if (path[0] === 'players' && path[1] === 'search') {
      const query = url.searchParams.get('name') || '';
      const [provider, cricsheet] = await Promise.all([
        searchProviderPlayers(env, query).catch(() => ({ data: [], info: {} })),
        searchCricsheetPlayers(query).catch(() => ({ data: [], info: {} })),
      ]);
      return json({
        status: 'success',
        data: uniqueById([...(provider.data || []), ...(cricsheet.data || [])]),
        info: { provider: provider.info, cricsheet: cricsheet.info },
      });
    }

    if (path[0] === 'players' && path[1]) {
      const id = decodeURIComponent(path[1]);
      if (id.startsWith('cricsheet-player-')) {
        const player = await getCricsheetPlayerInfo(id);
        return json({
          status: player ? 'success' : 'failure',
          data: player,
          info: {
            source: 'cricsheet',
            reason: player ? 'Derived player profile from Cricsheet ball-by-ball data.' : 'Player not found in Cricsheet data.',
          },
        }, player ? {} : { status: 404 });
      }

      const data = await providerRequest(env, 'players_info', { id });
      return json({ status: data.status, data: data.data, info: data.info });
    }

    if (path[0] === 'search' && path[1] === 'metadata') {
      return json({ status: 'success', data: await searchMetadata() });
    }

    if (path[0] === 'search') {
      const query = url.searchParams.get('q') || '';
      const year = url.searchParams.get('year') || '';
      const tournament = url.searchParams.get('tournament') || '';
      const tournamentSearch = isTournamentSearch(query, tournament);
      const archiveSearch = searchArchiveTournament(query, year, tournament);

      if (archiveSearch) {
        return json({
          status: 'success',
          data: {
            players: [],
            matches: archiveSearch.matches,
            series: archiveSearch.series,
            info: {
              players: { source: 'filter', reason: 'Player search skipped for tournament query.' },
              matches: archiveSearch.info,
              series: archiveSearch.info,
            },
          },
        });
      }

      const [providerPlayers, cricsheetPlayers, cricsheetMatches, providerSeries] = await Promise.all([
        tournamentSearch ? Promise.resolve({ data: [], info: { source: 'filter', reason: 'Player search skipped for tournament query.' } }) : searchProviderPlayers(env, query).catch((error) => ({ data: [], info: { reason: error.message } })),
        tournamentSearch ? Promise.resolve({ data: [], info: { source: 'filter', reason: 'Player search skipped for tournament query.' } }) : searchCricsheetPlayers(query).catch((error) => ({ data: [], info: { reason: error.message } })),
        searchCricsheetMatches(query, { year, tournament }).catch((error) => ({ data: [], info: { source: 'cricsheet', reason: error.message } })),
        searchProviderSeries(env, query).catch((error) => ({ data: [], info: { reason: error.message } })),
      ]);

      return json({
        status: 'success',
        data: {
          players: uniqueById([...(providerPlayers.data || []), ...(cricsheetPlayers.data || [])]),
          matches: cricsheetMatches.data || [],
          series: providerSeries.data || [],
          info: {
            players: providerPlayers.info || cricsheetPlayers.info || {},
            matches: cricsheetMatches.info || {},
            series: providerSeries.info || {},
          },
        },
      });
    }

    return json({ status: 'error', message: 'API route not found' }, { status: 404 });
  } catch (error) {
    return json({
      status: 'error',
      message: error?.message || 'Cloudflare function error',
    }, { status: 500 });
  }
}
