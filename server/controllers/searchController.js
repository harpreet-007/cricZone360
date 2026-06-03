const asyncHandler = require('express-async-handler');
const cricketApi = require('../services/cricketApi');

const aliasMap = {
  ipl: ['ipl', 'indian premier league'],
  wpl: ['wpl', "women's premier league", 'women premier league'],
  rcb: ['rcb', 'royal challengers bengaluru', 'royal challengers bangalore'],
  gt: ['gt', 'gujarat titans'],
  csk: ['csk', 'chennai super kings'],
  mi: ['mi', 'mumbai indians'],
  kkr: ['kkr', 'kolkata knight riders'],
  rr: ['rr', 'rajasthan royals'],
  dc: ['dc', 'delhi capitals'],
  srh: ['srh', 'sunrisers hyderabad'],
  pbks: ['pbks', 'punjab kings'],
  lsg: ['lsg', 'lucknow super giants'],
};

const tournamentQueryMap = {
  ipl: 'IPL',
  wpl: 'WPL',
  'icc-world-cup': 'ICC Cricket World Cup',
  'the-ashes': 'The Ashes',
  'u19-world-cup': 'ICC U19 Cricket World Cup',
  'u19-womens-world-cup': "ICC Women's U19 T20 World Cup",
};

const searchableText = (value) => String(value || '').toLowerCase();

const queryTerms = (query) => searchableText(query)
  .replace(/\bvs\b|\bv\b|versus/g, ' ')
  .split(/\s+/)
  .filter(Boolean);

const matchIncludesQuery = (match, query) => {
  const haystack = searchableText([
    match.name,
    match.series,
    match.tournamentKey,
    match.venue,
    match.status,
    ...(Array.isArray(match.teams) ? match.teams : []),
    ...(Array.isArray(match.teamInfo) ? match.teamInfo.map((team) => `${team.name || ''} ${team.shortname || ''}`) : []),
    ...(Array.isArray(match.playerNames) ? match.playerNames : []),
  ].join(' '));

  const terms = queryTerms(query);
  if (terms.length === 0) return false;

  return terms.every((term) => {
    const candidates = aliasMap[term] || [term];
    return candidates.some((candidate) => haystack.includes(candidate));
  });
};

const matchIncludesYear = (match, year) => {
  if (!year) return true;
  const value = String(year);
  return String(match.date || match.dateTimeGMT || '').startsWith(value) ||
    String(match.series || '').includes(value);
};

const itemIncludesQuery = (item, query) => {
  const haystack = searchableText([
    item.name,
    item.country,
    item.role,
    item.series,
    item.tournamentKey,
    item.venue,
    item.status,
    item.winner,
    ...(Array.isArray(item.teams) ? item.teams : []),
    ...(Array.isArray(item.teamInfo) ? item.teamInfo.map((team) => `${team.name || ''} ${team.shortname || ''}`) : []),
    ...(Array.isArray(item.playerNames) ? item.playerNames : []),
  ].join(' '));

  const terms = queryTerms(query);
  if (terms.length === 0) return false;

  return terms.every((term) => {
    const candidates = aliasMap[term] || [term];
    return candidates.some((candidate) => haystack.includes(candidate));
  });
};

const isLikelyPlayerSearch = (query, players) => {
  const terms = queryTerms(query);
  return terms.length >= 2 && Array.isArray(players) && players.some((player) => itemIncludesQuery(player, query));
};

const itemIncludesYear = (item, year) => {
  if (!year) return true;
  const value = String(year);
  return [item.date, item.dateTimeGMT, item.startDate, item.endDate, item.name]
    .filter(Boolean)
    .some((part) => String(part).includes(value));
};

/**
 * @desc    Global Search
 * @route   GET /api/search
 * @access  Public
 */
const globalSearch = asyncHandler(async (req, res) => {
  const { q, year, tournament } = req.query;
  if (!q) {
    return res.status(400).json({ status: 'error', message: 'Search query is required' });
  }
  const searchQuery = tournamentQueryMap[String(tournament || '')] || q;

  const [playerResults, matchResults, seriesResults] = await Promise.all([
    cricketApi.searchPlayers(searchQuery).catch(() => ({ data: [] })),
    cricketApi.searchMatches(searchQuery, { year, tournament }).then(res => {
        const matches = Array.isArray(res.data) ? res.data : [];
        return {
            data: res.info?.source === 'cricsheet'
              ? matches
              : matches.filter((match) => matchIncludesQuery(match, searchQuery) && matchIncludesYear(match, year)),
            info: res.info || {},
        };
    }).catch(() => ({ data: [] })),
    cricketApi.searchSeries(searchQuery).catch(() => ({ data: [] }))
  ]);

  const players = Array.isArray(playerResults.data)
    ? playerResults.data.filter((player) => itemIncludesQuery(player, searchQuery)).slice(0, 12)
    : [];
  const playerSearch = isLikelyPlayerSearch(searchQuery, players);
  const series = playerSearch
    ? []
    : (Array.isArray(seriesResults.data) ? seriesResults.data.filter((series) => itemIncludesQuery(series, searchQuery) && itemIncludesYear(series, year)).slice(0, 12) : []);
  const matches = Array.isArray(matchResults.data)
    ? matchResults.data.filter((match) => itemIncludesQuery(match, searchQuery) && matchIncludesYear(match, year))
    : [];

    res.json({
      status: 'success',
      data: {
      players,
      matches,
      series,
      info: {
        players: playerResults.info || {},
        matches: matchResults.info || {},
        series: seriesResults.info || {},
      },
    }
  });
});

const searchMetadata = asyncHandler(async (req, res) => {
  const metadata = await cricketApi.getTournamentMetadata();
  res.json(metadata);
});

module.exports = {
  globalSearch,
  searchMetadata,
};
