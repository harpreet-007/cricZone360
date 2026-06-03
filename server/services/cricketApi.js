const axios = require('axios');
const cricsheetApi = require('./cricsheetApi');

const API_BASE_URL = process.env.CRIC_API_BASE_URL || 'https://api.cricapi.com/v1';
const API_KEY = process.env.CRIC_API_KEY;
const USE_DEMO_DATA = process.env.USE_DEMO_DATA === 'true';

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
    id: 'demo-upcoming-u19',
    name: 'India U19 vs South Africa U19',
    series: 'U19 World Cup',
    matchType: 'odi',
    status: 'Match not started',
    venue: 'Willowmoore Park, Benoni',
    date: new Date(now + 1000 * 60 * 60 * 54).toISOString(),
    dateTimeGMT: new Date(now + 1000 * 60 * 60 * 54).toISOString(),
    matchStarted: false,
    matchEnded: false,
    teams: ['India U19', 'South Africa U19'],
    teamInfo: [
      { name: 'India U19', shortname: 'IND-U19' },
      { name: 'South Africa U19', shortname: 'SA-U19' },
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

const demoSeries = [
  { id: 'demo-ipl-2026', name: 'IPL 2026', startDate: '2026-03-20', endDate: '2026-05-31', t20: 74 },
  { id: 'demo-icc-events', name: 'ICC Champions Trophy', startDate: '2026-02-01', endDate: '2026-02-22', odi: 15 },
  { id: 'demo-women-odi', name: "Women's ODI Championship", startDate: '2026-01-10', endDate: '2026-07-18', odi: 24 },
  { id: 'demo-u19-world-cup', name: 'U19 World Cup', startDate: '2026-01-15', endDate: '2026-02-11', odi: 41 },
];

const u19WorldCupMatches = [
  {
    id: 'u19-world-cup-group-ind-sa',
    name: 'India U19 vs South Africa U19',
    series: 'U19 World Cup',
    matchType: 'odi',
    status: 'Match not started',
    venue: 'Willowmoore Park, Benoni',
    date: '2026-01-15',
    matchStarted: false,
    matchEnded: false,
    teams: ['India U19', 'South Africa U19'],
    teamInfo: [
      { name: 'India U19', shortname: 'IND-U19' },
      { name: 'South Africa U19', shortname: 'SA-U19' },
    ],
  },
  {
    id: 'u19-world-cup-group-aus-eng',
    name: 'Australia U19 vs England U19',
    series: 'U19 World Cup',
    matchType: 'odi',
    status: 'Match not started',
    venue: 'Senwes Park, Potchefstroom',
    date: '2026-01-16',
    matchStarted: false,
    matchEnded: false,
    teams: ['Australia U19', 'England U19'],
    teamInfo: [
      { name: 'Australia U19', shortname: 'AUS-U19' },
      { name: 'England U19', shortname: 'ENG-U19' },
    ],
  },
  {
    id: 'u19-world-cup-group-pak-nz',
    name: 'Pakistan U19 vs New Zealand U19',
    series: 'U19 World Cup',
    matchType: 'odi',
    status: 'Match not started',
    venue: 'Buffalo Park, East London',
    date: '2026-01-18',
    matchStarted: false,
    matchEnded: false,
    teams: ['Pakistan U19', 'New Zealand U19'],
    teamInfo: [
      { name: 'Pakistan U19', shortname: 'PAK-U19' },
      { name: 'New Zealand U19', shortname: 'NZ-U19' },
    ],
  },
  {
    id: 'u19-world-cup-group-sl-ban',
    name: 'Sri Lanka U19 vs Bangladesh U19',
    series: 'U19 World Cup',
    matchType: 'odi',
    status: 'Match not started',
    venue: 'Mangaung Oval, Bloemfontein',
    date: '2026-01-20',
    matchStarted: false,
    matchEnded: false,
    teams: ['Sri Lanka U19', 'Bangladesh U19'],
    teamInfo: [
      { name: 'Sri Lanka U19', shortname: 'SL-U19' },
      { name: 'Bangladesh U19', shortname: 'BAN-U19' },
    ],
  },
];

const u19WorldCupSeries = [
  {
    id: 'u19-world-cup-fixtures',
    name: 'U19 World Cup',
    startDate: '2026-01-15',
    endDate: '2026-02-11',
    odi: 41,
  },
];

const iplSeasonSummaries = [
  { year: '2026', totalMatches: 74, winner: 'Royal Challengers Bengaluru' },
  { year: '2025', totalMatches: 74, winner: 'Royal Challengers Bengaluru' },
  { year: '2024', totalMatches: 74, winner: 'Kolkata Knight Riders' },
  { year: '2023', totalMatches: 74, winner: 'Chennai Super Kings' },
  { year: '2022', totalMatches: 74, winner: 'Gujarat Titans' },
  { year: '2021', totalMatches: 60, winner: 'Chennai Super Kings' },
  { year: '2020', totalMatches: 60, winner: 'Mumbai Indians' },
  { year: '2019', totalMatches: 60, winner: 'Mumbai Indians' },
  { year: '2018', totalMatches: 60, winner: 'Chennai Super Kings' },
  { year: '2017', totalMatches: 60, winner: 'Mumbai Indians' },
  { year: '2016', totalMatches: 60, winner: 'Sunrisers Hyderabad' },
  { year: '2015', totalMatches: 60, winner: 'Mumbai Indians' },
  { year: '2014', totalMatches: 60, winner: 'Kolkata Knight Riders' },
  { year: '2013', totalMatches: 76, winner: 'Mumbai Indians' },
  { year: '2012', totalMatches: 76, winner: 'Kolkata Knight Riders' },
  { year: '2011', totalMatches: 74, winner: 'Chennai Super Kings' },
  { year: '2010', totalMatches: 60, winner: 'Chennai Super Kings' },
  { year: '2009', totalMatches: 59, winner: 'Deccan Chargers' },
  { year: '2008', totalMatches: 59, winner: 'Rajasthan Royals' },
];

const iplArchiveMatches = iplSeasonSummaries.flatMap((season) => (
  Array.from({ length: Number(season.totalMatches) || 0 }, (_, index) => {
    const matchNumber = index + 1;
    const isFinal = matchNumber === Number(season.totalMatches);
    const date = new Date(`${season.year}-03-01T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + index);
    const teams = isFinal
      ? [season.winner, 'IPL Finalist']
      : [`IPL ${season.year} Team ${((index * 2) % 10) + 1}`, `IPL ${season.year} Team ${((index * 2 + 1) % 10) + 1}`];

    return {
      id: `ipl-${season.year}-match-${String(matchNumber).padStart(2, '0')}`,
      name: isFinal ? `IPL ${season.year} Final` : `IPL ${season.year}, Match ${matchNumber}`,
      series: `IPL ${season.year}`,
      tournamentKey: 'ipl',
      matchType: 't20',
      status: isFinal
        ? `${season.winner} won IPL ${season.year}`
        : `IPL ${season.year} match ${matchNumber} result archived`,
      venue: 'IPL venues archive',
      date: date.toISOString().slice(0, 10),
      matchStarted: true,
      matchEnded: true,
      teams,
      teamInfo: teams.map((team) => ({
        name: team,
        shortname: String(team).split(' ').map((part) => part[0]).join('').slice(0, 5).toUpperCase(),
      })),
      totalMatches: season.totalMatches,
      winner: season.winner,
    };
  })
));

const iplArchiveSeries = iplSeasonSummaries.map((season) => ({
  id: `ipl-${season.year}-series`,
  name: `IPL ${season.year}`,
  tournamentKey: 'ipl',
  startDate: `${season.year}-03-01`,
  endDate: `${season.year}-05-31`,
  t20: season.totalMatches,
  winner: season.winner,
}));

const worldCupSeasonArchive = [
  { year: '2027', totalMatches: 54, winner: 'TBA', host: 'South Africa, Zimbabwe and Namibia', final: 'ICC Cricket World Cup 2027, Final', status: 'Match not started' },
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
];

const tournamentMetadataSeeds = [
  {
    key: 'ipl',
    label: 'IPL',
    query: 'IPL',
    seasons: iplSeasonSummaries.map((season) => ({
      year: season.year,
      totalMatches: season.totalMatches,
      winner: season.winner,
    })),
  },
  {
    key: 'icc-world-cup',
    label: 'ICC Cricket World Cup',
    query: 'ICC Cricket World Cup',
    seasons: worldCupSeasonArchive.map((season) => ({
      year: season.year,
      totalMatches: season.totalMatches,
      winner: season.winner,
    })),
  },
];

const tournamentArchiveSeasons = [
  { key: 'icc-world-cup', name: 'ICC Cricket World Cup', matchType: 'odi', years: worldCupSeasonArchive },
  { key: 'the-ashes', name: 'The Ashes', matchType: 'test', years: [
    { year: '2023', totalMatches: 5, winner: 'Series drawn 2-2; Australia retained', host: 'England', final: 'England vs Australia, 5th Test', status: 'England won by 49 runs' },
    { year: '2021', totalMatches: 5, winner: 'Australia', host: 'Australia', final: 'Australia vs England, 5th Test', status: 'Australia won by 146 runs' },
    { year: '2019', totalMatches: 5, winner: 'Series drawn 2-2; Australia retained', host: 'England', final: 'England vs Australia, 5th Test', status: 'England won by 135 runs' },
    { year: '2017', totalMatches: 5, winner: 'Australia', host: 'Australia', final: 'Australia vs England, 5th Test', status: 'Australia won by an innings and 123 runs' },
    { year: '2015', totalMatches: 5, winner: 'England', host: 'England', final: 'England vs Australia, 5th Test', status: 'Australia won by an innings and 46 runs' },
  ] },
  { key: 'u19-world-cup', name: 'ICC U19 Cricket World Cup', matchType: 'odi', years: [
    { year: '2026', totalMatches: 41, winner: 'TBA', host: 'Tournament venues TBA', final: 'ICC U19 Cricket World Cup 2026, Final', status: 'Match not started' },
    { year: '2024', totalMatches: 41, winner: 'Australia U19', host: 'South Africa', final: 'Australia U19 vs India U19, Final', status: 'Australia U19 won by 79 runs' },
    { year: '2022', totalMatches: 48, winner: 'India U19', host: 'West Indies', final: 'India U19 vs England U19, Final', status: 'India U19 won by 4 wickets' },
    { year: '2020', totalMatches: 48, winner: 'Bangladesh U19', host: 'South Africa', final: 'Bangladesh U19 vs India U19, Final', status: 'Bangladesh U19 won by 3 wickets' },
    { year: '2018', totalMatches: 48, winner: 'India U19', host: 'New Zealand', final: 'India U19 vs Australia U19, Final', status: 'India U19 won by 8 wickets' },
  ] },
];

const tournamentArchiveSeries = tournamentArchiveSeasons.flatMap((tournament) =>
  tournament.years.map((season) => ({
    id: `${tournament.key}-${season.year}-series`,
    name: `${tournament.name} ${season.year}`,
    tournamentKey: tournament.key,
    startDate: `${season.year}-01-01`,
    endDate: `${season.year}-12-31`,
    matches: season.totalMatches,
    winner: season.winner,
  }))
);

const tournamentArchiveMatches = tournamentArchiveSeasons.flatMap((tournament) =>
  tournament.years.flatMap((season) => {
    const base = {
      series: `${tournament.name} ${season.year}`,
      tournamentKey: tournament.key,
      matchType: tournament.matchType,
      venue: season.host,
      date: `${season.year}-11-19`,
      matchStarted: season.status !== 'Match not started',
      matchEnded: season.status !== 'Match not started',
      totalMatches: season.totalMatches,
      winner: season.winner,
    };

    return [
      {
        ...base,
        id: `${tournament.key}-${season.year}-final`,
        name: season.final,
        status: season.status,
        teams: season.final.split(',')[0].split(' vs '),
      },
      {
        ...base,
        id: `${tournament.key}-${season.year}-schedule`,
        name: `${tournament.name} ${season.year} match schedule`,
        status: `${season.totalMatches} matches scheduled in ${season.host}`,
        date: `${season.year}-01-01`,
        matchStarted: false,
        matchEnded: false,
        teams: [season.winner, 'Tournament field'],
      },
      {
        ...base,
        id: `${tournament.key}-${season.year}-results`,
        name: `${tournament.name} ${season.year} match results`,
        status: `Winner Team: ${season.winner}`,
        date: `${season.year}-12-31`,
        teams: [season.winner, 'Tournament field'],
      },
    ];
  })
);

const worldCupFullMatchArchive = worldCupSeasonArchive.flatMap((season) => {
  const matchCount = Number(season.totalMatches) || 0;
  const finalTeams = season.final.includes(' vs ') ? season.final.split(',')[0].split(' vs ') : [season.winner, 'Tournament finalist'];
  const firstMatchDate = `${season.year}-02-01`;

  return Array.from({ length: matchCount }, (_, index) => {
    const number = index + 1;
    const isFinal = number === matchCount;
    const isSemiFinal = matchCount > 4 && number >= matchCount - 2 && number < matchCount;
    const date = new Date(`${firstMatchDate}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + index);
    const teams = isFinal
      ? finalTeams
      : [`World Cup ${season.year} Team ${((index * 2) % 16) + 1}`, `World Cup ${season.year} Team ${((index * 2 + 1) % 16) + 1}`];

    return {
      id: `icc-world-cup-${season.year}-match-${String(number).padStart(2, '0')}`,
      name: isFinal
        ? season.final
        : `ICC Cricket World Cup ${season.year}, ${isSemiFinal ? `Semi-Final ${number - (matchCount - 3)}` : `Match ${number}`}`,
      series: `ICC Cricket World Cup ${season.year}`,
      tournamentKey: 'icc-world-cup',
      matchType: 'odi',
      status: isFinal
        ? season.status
        : season.status === 'Match not started'
          ? 'Match not started'
          : `World Cup ${season.year} match ${number} result archived`,
      venue: season.host,
      date: date.toISOString().slice(0, 10),
      matchStarted: season.status !== 'Match not started',
      matchEnded: season.status !== 'Match not started',
      teams,
      teamInfo: teams.map((team) => ({
        name: team,
        shortname: String(team).split(' ').map((part) => part[0]).join('').slice(0, 5).toUpperCase(),
      })),
      totalMatches: season.totalMatches,
      winner: season.winner,
    };
  });
});

const buildNumberedTournamentMatches = ({ key, label, matchType, seasons }) => seasons.flatMap((season) => (
  Array.from({ length: Number(season.totalMatches) || 0 }, (_, index) => {
    const matchNumber = index + 1;
    const isFinal = matchNumber === Number(season.totalMatches);
    const date = new Date(`${season.year}-01-01T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + index);
    const finalTeams = season.final?.includes(' vs ')
      ? season.final.split(',')[0].split(' vs ')
      : [season.winner || `${label} winner`, `${label} finalist`];
    const teams = isFinal
      ? finalTeams
      : [`${label} ${season.year} Team ${((index * 2) % 16) + 1}`, `${label} ${season.year} Team ${((index * 2 + 1) % 16) + 1}`];

    return {
      id: `${key}-${season.year}-match-${String(matchNumber).padStart(2, '0')}`,
      name: isFinal ? season.final || `${label} ${season.year}, Final` : `${label} ${season.year}, Match ${matchNumber}`,
      series: `${label} ${season.year}`,
      tournamentKey: key,
      matchType,
      status: isFinal
        ? season.status || `${season.winner} won ${label} ${season.year}`
        : season.status === 'Match not started'
          ? 'Match not started'
          : `${label} ${season.year} match ${matchNumber} result archived`,
      venue: season.host || `${label} venues archive`,
      date: date.toISOString().slice(0, 10),
      matchStarted: season.status !== 'Match not started',
      matchEnded: season.status !== 'Match not started',
      teams,
      teamInfo: teams.map((team) => ({
        name: team,
        shortname: String(team).split(' ').map((part) => part[0]).join('').slice(0, 5).toUpperCase(),
      })),
      totalMatches: season.totalMatches,
      winner: season.winner,
    };
  })
));

const u19FullMatchArchive = buildNumberedTournamentMatches({
  key: 'u19-world-cup',
  label: 'ICC U19 Cricket World Cup',
  matchType: 'odi',
  seasons: tournamentArchiveSeasons.find((item) => item.key === 'u19-world-cup')?.years || [],
});

const ashesSeriesArchive = [
  {
    year: '2023',
    winner: 'Series drawn 2-2; Australia retained',
    host: 'England',
    tests: [
      ['1st Test', 'England vs Australia, 1st Test', 'Australia won by 2 wickets', 'Edgbaston, Birmingham', '2023-06-16'],
      ['2nd Test', 'England vs Australia, 2nd Test', 'Australia won by 43 runs', 'Lord\'s, London', '2023-06-28'],
      ['3rd Test', 'England vs Australia, 3rd Test', 'England won by 3 wickets', 'Headingley, Leeds', '2023-07-06'],
      ['4th Test', 'England vs Australia, 4th Test', 'Match drawn', 'Old Trafford, Manchester', '2023-07-19'],
      ['5th Test', 'England vs Australia, 5th Test', 'England won by 49 runs', 'The Oval, London', '2023-07-27'],
    ],
  },
  {
    year: '2021',
    winner: 'Australia',
    host: 'Australia',
    tests: [
      ['1st Test', 'Australia vs England, 1st Test', 'Australia won by 9 wickets', 'The Gabba, Brisbane', '2021-12-08'],
      ['2nd Test', 'Australia vs England, 2nd Test', 'Australia won by 275 runs', 'Adelaide Oval, Adelaide', '2021-12-16'],
      ['3rd Test', 'Australia vs England, 3rd Test', 'Australia won by an innings and 14 runs', 'MCG, Melbourne', '2021-12-26'],
      ['4th Test', 'Australia vs England, 4th Test', 'Match drawn', 'SCG, Sydney', '2022-01-05'],
      ['5th Test', 'Australia vs England, 5th Test', 'Australia won by 146 runs', 'Bellerive Oval, Hobart', '2022-01-14'],
    ],
  },
  {
    year: '2019',
    winner: 'Series drawn 2-2; Australia retained',
    host: 'England',
    tests: [
      ['1st Test', 'England vs Australia, 1st Test', 'Australia won by 251 runs', 'Edgbaston, Birmingham', '2019-08-01'],
      ['2nd Test', 'England vs Australia, 2nd Test', 'Match drawn', 'Lord\'s, London', '2019-08-14'],
      ['3rd Test', 'England vs Australia, 3rd Test', 'England won by 1 wicket', 'Headingley, Leeds', '2019-08-22'],
      ['4th Test', 'England vs Australia, 4th Test', 'Australia won by 185 runs', 'Old Trafford, Manchester', '2019-09-04'],
      ['5th Test', 'England vs Australia, 5th Test', 'England won by 135 runs', 'The Oval, London', '2019-09-12'],
    ],
  },
  {
    year: '2017',
    winner: 'Australia',
    host: 'Australia',
    tests: [
      ['1st Test', 'Australia vs England, 1st Test', 'Australia won by 10 wickets', 'The Gabba, Brisbane', '2017-11-23'],
      ['2nd Test', 'Australia vs England, 2nd Test', 'Australia won by 120 runs', 'Adelaide Oval, Adelaide', '2017-12-02'],
      ['3rd Test', 'Australia vs England, 3rd Test', 'Australia won by an innings and 41 runs', 'WACA Ground, Perth', '2017-12-14'],
      ['4th Test', 'Australia vs England, 4th Test', 'Match drawn', 'MCG, Melbourne', '2017-12-26'],
      ['5th Test', 'Australia vs England, 5th Test', 'Australia won by an innings and 123 runs', 'SCG, Sydney', '2018-01-04'],
    ],
  },
  {
    year: '2015',
    winner: 'England',
    host: 'England',
    tests: [
      ['1st Test', 'England vs Australia, 1st Test', 'England won by 169 runs', 'Sophia Gardens, Cardiff', '2015-07-08'],
      ['2nd Test', 'England vs Australia, 2nd Test', 'Australia won by 405 runs', 'Lord\'s, London', '2015-07-16'],
      ['3rd Test', 'England vs Australia, 3rd Test', 'England won by 8 wickets', 'Edgbaston, Birmingham', '2015-07-29'],
      ['4th Test', 'England vs Australia, 4th Test', 'England won by an innings and 78 runs', 'Trent Bridge, Nottingham', '2015-08-06'],
      ['5th Test', 'England vs Australia, 5th Test', 'Australia won by an innings and 46 runs', 'The Oval, London', '2015-08-20'],
    ],
  },
];

const ashesFullMatchArchive = ashesSeriesArchive.flatMap((series) =>
  series.tests.map(([round, name, status, venue, date], index) => ({
    id: `the-ashes-${series.year}-test-${index + 1}`,
    name,
    series: `The Ashes ${series.year}`,
    tournamentKey: 'the-ashes',
    matchType: 'test',
    status,
    venue,
    date,
    matchStarted: true,
    matchEnded: true,
    teams: name.split(',')[0].split(' vs '),
    teamInfo: name.split(',')[0].split(' vs ').map((team) => ({ name: team, shortname: team === 'Australia' ? 'AUS' : 'ENG' })),
    round,
    totalMatches: 5,
    winner: series.winner,
  }))
);

const womenTournamentMatches = [
  {
    id: 'wpl-2026-final-rcbw-dc',
    name: 'Royal Challengers Bengaluru Women vs Delhi Capitals Women, Final',
    series: 'WPL 2026',
    tournamentKey: 'wpl',
    matchType: 't20',
    status: 'Royal Challengers Bengaluru Women won the WPL 2026 final',
    venue: 'Baroda Cricket Association Stadium, Vadodara',
    date: '2026-02-05',
    matchStarted: true,
    matchEnded: true,
    teams: ['Royal Challengers Bengaluru Women', 'Delhi Capitals Women'],
    teamInfo: [
      { name: 'Royal Challengers Bengaluru Women', shortname: 'RCB-W' },
      { name: 'Delhi Capitals Women', shortname: 'DC-W' },
    ],
    playerNames: ['Smriti Mandhana', 'Ellyse Perry', 'Meg Lanning'],
  },
  {
    id: 'wpl-2026-match-20-dc-upw',
    name: 'Delhi Capitals Women vs UP Warriorz, Match 20',
    series: 'WPL 2026',
    tournamentKey: 'wpl',
    matchType: 't20',
    status: 'Delhi Capitals Women won by 5 wickets',
    venue: 'Baroda Cricket Association Stadium, Vadodara',
    date: '2026-02-01',
    matchStarted: true,
    matchEnded: true,
    teams: ['Delhi Capitals Women', 'UP Warriorz'],
    teamInfo: [
      { name: 'Delhi Capitals Women', shortname: 'DC-W' },
      { name: 'UP Warriorz', shortname: 'UPW' },
    ],
    playerNames: ['Meg Lanning', 'Deepti Sharma'],
  },
  {
    id: 'wpl-2026-match-1-mi-rcbw',
    name: 'Mumbai Indians Women vs Royal Challengers Bengaluru Women, Match 1',
    series: 'WPL 2026',
    tournamentKey: 'wpl',
    matchType: 't20',
    status: 'Royal Challengers Bengaluru Women won by 3 wickets',
    venue: 'DY Patil Sports Academy, Navi Mumbai',
    date: '2026-01-09',
    matchStarted: true,
    matchEnded: true,
    teams: ['Mumbai Indians Women', 'Royal Challengers Bengaluru Women'],
    teamInfo: [
      { name: 'Mumbai Indians Women', shortname: 'MI-W' },
      { name: 'Royal Challengers Bengaluru Women', shortname: 'RCB-W' },
    ],
    playerNames: ['Nat Sciver-Brunt', 'Smriti Mandhana'],
  },
  {
    id: 'wpl-2026-schedule',
    name: 'WPL 2026 match schedule',
    series: 'WPL 2026',
    tournamentKey: 'wpl',
    matchType: 't20',
    status: '22 matches scheduled from January 9 to February 5',
    venue: 'Navi Mumbai and Vadodara',
    date: '2026-01-09',
    matchStarted: false,
    matchEnded: false,
    teams: ['Royal Challengers Bengaluru Women', 'Tournament field'],
  },
  {
    id: 'wpl-2026-results',
    name: 'WPL 2026 match results',
    series: 'WPL 2026',
    tournamentKey: 'wpl',
    matchType: 't20',
    status: 'Winner Team: Royal Challengers Bengaluru Women',
    venue: 'WPL results archive',
    date: '2026-02-05',
    matchStarted: true,
    matchEnded: true,
    teams: ['Royal Challengers Bengaluru Women', 'Tournament field'],
  },
  {
    id: 'wpl-2025-final-mi-dc',
    name: 'Mumbai Indians Women vs Delhi Capitals Women, Final',
    series: 'WPL 2025',
    tournamentKey: 'wpl',
    matchType: 't20',
    status: 'Mumbai Indians Women won by 8 runs',
    venue: 'Brabourne Stadium, Mumbai',
    date: '2025-03-15',
    matchStarted: true,
    matchEnded: true,
    teams: ['Mumbai Indians Women', 'Delhi Capitals Women'],
    teamInfo: [
      { name: 'Mumbai Indians Women', shortname: 'MI-W' },
      { name: 'Delhi Capitals Women', shortname: 'DC-W' },
    ],
    playerNames: ['Harmanpreet Kaur', 'Nat Sciver-Brunt', 'Meg Lanning'],
  },
  {
    id: 'wpl-2025-eliminator-mi-gg',
    name: 'Mumbai Indians Women vs Gujarat Giants Women, Eliminator',
    series: 'WPL 2025',
    tournamentKey: 'wpl',
    matchType: 't20',
    status: 'Mumbai Indians Women won',
    venue: 'Brabourne Stadium, Mumbai',
    date: '2025-03-13',
    matchStarted: true,
    matchEnded: true,
    teams: ['Mumbai Indians Women', 'Gujarat Giants Women'],
    teamInfo: [
      { name: 'Mumbai Indians Women', shortname: 'MI-W' },
      { name: 'Gujarat Giants Women', shortname: 'GG-W' },
    ],
    playerNames: ['Hayley Matthews', 'Beth Mooney'],
  },
  {
    id: 'wpl-2025-league-rcbw-mi',
    name: 'Royal Challengers Bengaluru Women vs Mumbai Indians Women',
    series: 'WPL 2025',
    tournamentKey: 'wpl',
    matchType: 't20',
    status: 'Mumbai Indians Women won',
    venue: 'M. Chinnaswamy Stadium, Bengaluru',
    date: '2025-02-21',
    matchStarted: true,
    matchEnded: true,
    teams: ['Royal Challengers Bengaluru Women', 'Mumbai Indians Women'],
    teamInfo: [
      { name: 'Royal Challengers Bengaluru Women', shortname: 'RCB-W' },
      { name: 'Mumbai Indians Women', shortname: 'MI-W' },
    ],
    playerNames: ['Smriti Mandhana', 'Harmanpreet Kaur'],
  },
  {
    id: 'wpl-2024-final-rcbw-dc',
    name: 'Royal Challengers Bengaluru Women vs Delhi Capitals Women, Final',
    series: 'WPL 2024',
    tournamentKey: 'wpl',
    matchType: 't20',
    status: 'Royal Challengers Bengaluru Women won by 8 wickets',
    venue: 'Arun Jaitley Stadium, Delhi',
    date: '2024-03-17',
    matchStarted: true,
    matchEnded: true,
    teams: ['Royal Challengers Bengaluru Women', 'Delhi Capitals Women'],
    teamInfo: [
      { name: 'Royal Challengers Bengaluru Women', shortname: 'RCB-W' },
      { name: 'Delhi Capitals Women', shortname: 'DC-W' },
    ],
    playerNames: ['Smriti Mandhana', 'Ellyse Perry'],
  },
  {
    id: 'wpl-2024-schedule',
    name: 'WPL 2024 match schedule',
    series: 'WPL 2024',
    tournamentKey: 'wpl',
    matchType: 't20',
    status: '22 matches scheduled across Bengaluru and Delhi',
    venue: 'WPL venues archive',
    date: '2024-02-23',
    matchStarted: false,
    matchEnded: false,
    teams: ['Royal Challengers Bengaluru Women', 'Tournament field'],
  },
  {
    id: 'wpl-2024-results',
    name: 'WPL 2024 match results',
    series: 'WPL 2024',
    tournamentKey: 'wpl',
    matchType: 't20',
    status: 'Winner Team: Royal Challengers Bengaluru Women',
    venue: 'WPL results archive',
    date: '2024-03-17',
    matchStarted: true,
    matchEnded: true,
    teams: ['Royal Challengers Bengaluru Women', 'Tournament field'],
  },
  {
    id: 'wpl-2023-final-mi-dc',
    name: 'Mumbai Indians Women vs Delhi Capitals Women, Final',
    series: 'WPL 2023',
    tournamentKey: 'wpl',
    matchType: 't20',
    status: 'Mumbai Indians Women won by 7 wickets',
    venue: 'Brabourne Stadium, Mumbai',
    date: '2023-03-26',
    matchStarted: true,
    matchEnded: true,
    teams: ['Mumbai Indians Women', 'Delhi Capitals Women'],
    teamInfo: [
      { name: 'Mumbai Indians Women', shortname: 'MI-W' },
      { name: 'Delhi Capitals Women', shortname: 'DC-W' },
    ],
    playerNames: ['Harmanpreet Kaur', 'Nat Sciver-Brunt'],
  },
  {
    id: 'wpl-2023-schedule',
    name: 'WPL 2023 match schedule',
    series: 'WPL 2023',
    tournamentKey: 'wpl',
    matchType: 't20',
    status: '22 matches scheduled in Mumbai',
    venue: 'WPL venues archive',
    date: '2023-03-04',
    matchStarted: false,
    matchEnded: false,
    teams: ['Mumbai Indians Women', 'Tournament field'],
  },
  {
    id: 'wpl-2023-results',
    name: 'WPL 2023 match results',
    series: 'WPL 2023',
    tournamentKey: 'wpl',
    matchType: 't20',
    status: 'Winner Team: Mumbai Indians Women',
    venue: 'WPL results archive',
    date: '2023-03-26',
    matchStarted: true,
    matchEnded: true,
    teams: ['Mumbai Indians Women', 'Tournament field'],
  },
  {
    id: 'u19-womens-t20-wc-2025-final-ind-sa',
    name: 'India Women U19 vs South Africa Women U19, Final',
    series: 'ICC Women\'s U19 T20 World Cup 2025',
    tournamentKey: 'u19-womens-world-cup',
    matchType: 't20',
    status: 'India Women U19 won by 9 wickets',
    venue: 'Bayuemas Oval, Kuala Lumpur',
    date: '2025-02-02',
    matchStarted: true,
    matchEnded: true,
    teams: ['India Women U19', 'South Africa Women U19'],
    teamInfo: [
      { name: 'India Women U19', shortname: 'IND-W-U19' },
      { name: 'South Africa Women U19', shortname: 'SA-W-U19' },
    ],
    playerNames: ['Gongadi Trisha', 'Sanika Chalke'],
  },
  {
    id: 'u19-womens-t20-wc-2025-semi-ind-eng',
    name: 'India Women U19 vs England Women U19, Semi-Final',
    series: 'ICC Women\'s U19 T20 World Cup 2025',
    tournamentKey: 'u19-womens-world-cup',
    matchType: 't20',
    status: 'India Women U19 won',
    venue: 'Bayuemas Oval, Kuala Lumpur',
    date: '2025-01-31',
    matchStarted: true,
    matchEnded: true,
    teams: ['India Women U19', 'England Women U19'],
    teamInfo: [
      { name: 'India Women U19', shortname: 'IND-W-U19' },
      { name: 'England Women U19', shortname: 'ENG-W-U19' },
    ],
    playerNames: ['Gongadi Trisha'],
  },
  {
    id: 'u19-womens-t20-wc-2025-group-ind-wi',
    name: 'India Women U19 vs West Indies Women U19',
    series: 'ICC Women\'s U19 T20 World Cup 2025',
    tournamentKey: 'u19-womens-world-cup',
    matchType: 't20',
    status: 'India Women U19 won',
    venue: 'Bayuemas Oval, Kuala Lumpur',
    date: '2025-01-19',
    matchStarted: true,
    matchEnded: true,
    teams: ['India Women U19', 'West Indies Women U19'],
    teamInfo: [
      { name: 'India Women U19', shortname: 'IND-W-U19' },
      { name: 'West Indies Women U19', shortname: 'WI-W-U19' },
    ],
    playerNames: ['Gongadi Trisha'],
  },
];

const womenTournamentSeries = [
  { id: 'wpl-2026-series', name: 'WPL 2026', tournamentKey: 'wpl', startDate: '2026-01-09', endDate: '2026-02-05', t20: 22, winner: 'Royal Challengers Bengaluru Women' },
  { id: 'wpl-2025-series', name: 'WPL 2025', tournamentKey: 'wpl', startDate: '2025-02-14', endDate: '2025-03-15', t20: 22, winner: 'Mumbai Indians Women' },
  { id: 'wpl-2024-series', name: 'WPL 2024', tournamentKey: 'wpl', startDate: '2024-02-23', endDate: '2024-03-17', t20: 22, winner: 'Royal Challengers Bengaluru Women' },
  { id: 'wpl-2023-series', name: 'WPL 2023', tournamentKey: 'wpl', startDate: '2023-03-04', endDate: '2023-03-26', t20: 22, winner: 'Mumbai Indians Women' },
  { id: 'u19-womens-t20-wc-2025-series', name: 'ICC Women\'s U19 T20 World Cup 2025', tournamentKey: 'u19-womens-world-cup', startDate: '2025-01-18', endDate: '2025-02-02', t20: 41, winner: 'India U19' },
];

const womenU19FullMatchArchive = buildNumberedTournamentMatches({
  key: 'u19-womens-world-cup',
  label: 'ICC Women\'s U19 T20 World Cup',
  matchType: 't20',
  seasons: womenTournamentSeries
    .filter((series) => series.tournamentKey === 'u19-womens-world-cup')
    .map((series) => ({
      year: String(series.name).match(/\b(19|20)\d{2}\b/)?.[0],
      totalMatches: series.t20,
      winner: series.winner,
      host: 'Malaysia',
      final: 'India Women U19 vs South Africa Women U19, Final',
      status: 'India U19 won by 9 wickets',
    })),
});

const wpl2023FullMatchArchive = [
  ['match-01-gg-mi', 'Gujarat Giants Women vs Mumbai Indians Women, Match 1', 'Mumbai Indians Women won', 'DY Patil Sports Academy, Navi Mumbai', '2023-03-04', ['Gujarat Giants Women', 'Mumbai Indians Women']],
  ['match-02-rcbw-dc', 'Royal Challengers Bengaluru Women vs Delhi Capitals Women, Match 2', 'Delhi Capitals Women won', 'Brabourne Stadium, Mumbai', '2023-03-05', ['Royal Challengers Bengaluru Women', 'Delhi Capitals Women']],
  ['match-03-upw-gg', 'UP Warriorz vs Gujarat Giants Women, Match 3', 'UP Warriorz won by 3 wickets', 'DY Patil Sports Academy, Navi Mumbai', '2023-03-05', ['UP Warriorz', 'Gujarat Giants Women']],
  ['match-04-mi-rcbw', 'Mumbai Indians Women vs Royal Challengers Bengaluru Women, Match 4', 'Mumbai Indians Women won', 'Brabourne Stadium, Mumbai', '2023-03-06', ['Mumbai Indians Women', 'Royal Challengers Bengaluru Women']],
  ['match-05-dc-upw', 'Delhi Capitals Women vs UP Warriorz, Match 5', 'Delhi Capitals Women won', 'DY Patil Sports Academy, Navi Mumbai', '2023-03-07', ['Delhi Capitals Women', 'UP Warriorz']],
  ['match-06-gg-rcbw', 'Gujarat Giants Women vs Royal Challengers Bengaluru Women, Match 6', 'Gujarat Giants Women won', 'Brabourne Stadium, Mumbai', '2023-03-08', ['Gujarat Giants Women', 'Royal Challengers Bengaluru Women']],
  ['match-07-dc-mi', 'Delhi Capitals Women vs Mumbai Indians Women, Match 7', 'Mumbai Indians Women won', 'DY Patil Sports Academy, Navi Mumbai', '2023-03-09', ['Delhi Capitals Women', 'Mumbai Indians Women']],
  ['match-08-rcbw-upw', 'Royal Challengers Bengaluru Women vs UP Warriorz, Match 8', 'UP Warriorz won', 'Brabourne Stadium, Mumbai', '2023-03-10', ['Royal Challengers Bengaluru Women', 'UP Warriorz']],
  ['match-09-gg-dc', 'Gujarat Giants Women vs Delhi Capitals Women, Match 9', 'Delhi Capitals Women won', 'DY Patil Sports Academy, Navi Mumbai', '2023-03-11', ['Gujarat Giants Women', 'Delhi Capitals Women']],
  ['match-10-upw-mi', 'UP Warriorz vs Mumbai Indians Women, Match 10', 'Mumbai Indians Women won', 'Brabourne Stadium, Mumbai', '2023-03-12', ['UP Warriorz', 'Mumbai Indians Women']],
  ['match-11-dc-rcbw', 'Delhi Capitals Women vs Royal Challengers Bengaluru Women, Match 11', 'Delhi Capitals Women won', 'DY Patil Sports Academy, Navi Mumbai', '2023-03-13', ['Delhi Capitals Women', 'Royal Challengers Bengaluru Women']],
  ['match-12-mi-gg', 'Mumbai Indians Women vs Gujarat Giants Women, Match 12', 'Mumbai Indians Women won', 'Brabourne Stadium, Mumbai', '2023-03-14', ['Mumbai Indians Women', 'Gujarat Giants Women']],
  ['match-13-upw-rcbw', 'UP Warriorz vs Royal Challengers Bengaluru Women, Match 13', 'Royal Challengers Bengaluru Women won', 'DY Patil Sports Academy, Navi Mumbai', '2023-03-15', ['UP Warriorz', 'Royal Challengers Bengaluru Women']],
  ['match-14-dc-gg', 'Delhi Capitals Women vs Gujarat Giants Women, Match 14', 'Gujarat Giants Women won', 'Brabourne Stadium, Mumbai', '2023-03-16', ['Delhi Capitals Women', 'Gujarat Giants Women']],
  ['match-15-mi-upw', 'Mumbai Indians Women vs UP Warriorz, Match 15', 'UP Warriorz won', 'DY Patil Sports Academy, Navi Mumbai', '2023-03-18', ['Mumbai Indians Women', 'UP Warriorz']],
  ['match-16-rcbw-gg', 'Royal Challengers Bengaluru Women vs Gujarat Giants Women, Match 16', 'Royal Challengers Bengaluru Women won', 'Brabourne Stadium, Mumbai', '2023-03-18', ['Royal Challengers Bengaluru Women', 'Gujarat Giants Women']],
  ['match-17-gg-upw', 'Gujarat Giants Women vs UP Warriorz, Match 17', 'UP Warriorz won', 'Brabourne Stadium, Mumbai', '2023-03-20', ['Gujarat Giants Women', 'UP Warriorz']],
  ['match-18-mi-dc', 'Mumbai Indians Women vs Delhi Capitals Women, Match 18', 'Delhi Capitals Women won by 9 wickets', 'DY Patil Sports Academy, Navi Mumbai', '2023-03-20', ['Mumbai Indians Women', 'Delhi Capitals Women']],
  ['match-19-rcbw-mi', 'Royal Challengers Bengaluru Women vs Mumbai Indians Women, Match 19', 'Mumbai Indians Women won by 4 wickets', 'DY Patil Sports Academy, Navi Mumbai', '2023-03-21', ['Royal Challengers Bengaluru Women', 'Mumbai Indians Women']],
  ['match-20-upw-dc', 'UP Warriorz vs Delhi Capitals Women, Match 20', 'Delhi Capitals Women won by 5 wickets', 'Brabourne Stadium, Mumbai', '2023-03-21', ['UP Warriorz', 'Delhi Capitals Women']],
  ['eliminator-mi-upw', 'Mumbai Indians Women vs UP Warriorz, Eliminator', 'Mumbai Indians Women won by 72 runs', 'DY Patil Sports Academy, Navi Mumbai', '2023-03-24', ['Mumbai Indians Women', 'UP Warriorz']],
  ['final-mi-dc', 'Mumbai Indians Women vs Delhi Capitals Women, Final', 'Mumbai Indians Women won by 7 wickets', 'Brabourne Stadium, Mumbai', '2023-03-26', ['Mumbai Indians Women', 'Delhi Capitals Women']],
].map(([id, name, status, venue, date, teams]) => ({
  id: `wpl-2023-${id}`,
  name,
  series: 'WPL 2023',
  tournamentKey: 'wpl',
  matchType: 't20',
  status,
  venue,
  date,
  matchStarted: true,
  matchEnded: true,
  teams,
  teamInfo: Array.isArray(teams) ? teams.map((team) => ({ name: team, shortname: String(team).split(' ').map((part) => part[0]).join('').slice(0, 5).toUpperCase() })) : [],
}));

const wplTeamShortNames = {
  'Mumbai Indians Women': 'MI-W',
  'Delhi Capitals Women': 'DC-W',
  'Gujarat Giants Women': 'GG-W',
  'Royal Challengers Bengaluru Women': 'RCB-W',
  'UP Warriorz': 'UPW',
};

const wplLeaguePairs = [
  ['Gujarat Giants Women', 'Mumbai Indians Women'],
  ['Royal Challengers Bengaluru Women', 'Delhi Capitals Women'],
  ['UP Warriorz', 'Gujarat Giants Women'],
  ['Mumbai Indians Women', 'Royal Challengers Bengaluru Women'],
  ['Delhi Capitals Women', 'UP Warriorz'],
  ['Gujarat Giants Women', 'Royal Challengers Bengaluru Women'],
  ['Delhi Capitals Women', 'Mumbai Indians Women'],
  ['Royal Challengers Bengaluru Women', 'UP Warriorz'],
  ['Gujarat Giants Women', 'Delhi Capitals Women'],
  ['UP Warriorz', 'Mumbai Indians Women'],
  ['Delhi Capitals Women', 'Royal Challengers Bengaluru Women'],
  ['Mumbai Indians Women', 'Gujarat Giants Women'],
  ['UP Warriorz', 'Royal Challengers Bengaluru Women'],
  ['Delhi Capitals Women', 'Gujarat Giants Women'],
  ['Mumbai Indians Women', 'UP Warriorz'],
  ['Royal Challengers Bengaluru Women', 'Gujarat Giants Women'],
  ['Gujarat Giants Women', 'UP Warriorz'],
  ['Mumbai Indians Women', 'Delhi Capitals Women'],
  ['Royal Challengers Bengaluru Women', 'Mumbai Indians Women'],
  ['UP Warriorz', 'Delhi Capitals Women'],
];

const wplDate = (startDate, offset) => {
  const date = new Date(`${startDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
};

const slugTeam = (team) => wplTeamShortNames[team]?.toLowerCase().replace(/[^a-z0-9]+/g, '') || String(team).toLowerCase().replace(/[^a-z0-9]+/g, '-');

const buildWplSeasonArchive = ({ year, startDate, winner, runnerUp, eliminatorTeams, venues }) => {
  const venueFor = (index) => venues[index % venues.length];
  const leagueMatches = wplLeaguePairs.map(([teamA, teamB], index) => ({
    id: `wpl-${year}-match-${String(index + 1).padStart(2, '0')}-${slugTeam(teamA)}-${slugTeam(teamB)}`,
    name: `${teamA} vs ${teamB}, Match ${index + 1}`,
    series: `WPL ${year}`,
    tournamentKey: 'wpl',
    matchType: 't20',
    status: `${year} WPL league match result archived`,
    venue: venueFor(index),
    date: wplDate(startDate, index),
    matchStarted: true,
    matchEnded: true,
    teams: [teamA, teamB],
    teamInfo: [teamA, teamB].map((team) => ({ name: team, shortname: wplTeamShortNames[team] || 'WPL' })),
  }));

  return [
    ...leagueMatches,
    {
      id: `wpl-${year}-eliminator-${slugTeam(eliminatorTeams[0])}-${slugTeam(eliminatorTeams[1])}`,
      name: `${eliminatorTeams[0]} vs ${eliminatorTeams[1]}, Eliminator`,
      series: `WPL ${year}`,
      tournamentKey: 'wpl',
      matchType: 't20',
      status: `${year} WPL Eliminator result archived`,
      venue: venueFor(20),
      date: wplDate(startDate, 21),
      matchStarted: true,
      matchEnded: true,
      teams: eliminatorTeams,
      teamInfo: eliminatorTeams.map((team) => ({ name: team, shortname: wplTeamShortNames[team] || 'WPL' })),
    },
    {
      id: `wpl-${year}-final-${slugTeam(winner)}-${slugTeam(runnerUp)}`,
      name: `${winner} vs ${runnerUp}, Final`,
      series: `WPL ${year}`,
      tournamentKey: 'wpl',
      matchType: 't20',
      status: `${winner} won WPL ${year}`,
      venue: venueFor(21),
      date: wplDate(startDate, 23),
      matchStarted: true,
      matchEnded: true,
      teams: [winner, runnerUp],
      teamInfo: [winner, runnerUp].map((team) => ({ name: team, shortname: wplTeamShortNames[team] || 'WPL' })),
    },
  ];
};

const wplFullSeasonArchive = [
  ...wpl2023FullMatchArchive,
  ...buildWplSeasonArchive({
    year: '2024',
    startDate: '2024-02-23',
    winner: 'Royal Challengers Bengaluru Women',
    runnerUp: 'Delhi Capitals Women',
    eliminatorTeams: ['Mumbai Indians Women', 'Royal Challengers Bengaluru Women'],
    venues: ['M. Chinnaswamy Stadium, Bengaluru', 'Arun Jaitley Stadium, Delhi'],
  }),
  ...buildWplSeasonArchive({
    year: '2025',
    startDate: '2025-02-14',
    winner: 'Mumbai Indians Women',
    runnerUp: 'Delhi Capitals Women',
    eliminatorTeams: ['Mumbai Indians Women', 'Gujarat Giants Women'],
    venues: ['BCA Stadium, Vadodara', 'M. Chinnaswamy Stadium, Bengaluru', 'Ekana Cricket Stadium, Lucknow', 'Brabourne Stadium, Mumbai'],
  }),
  ...buildWplSeasonArchive({
    year: '2026',
    startDate: '2026-01-09',
    winner: 'Royal Challengers Bengaluru Women',
    runnerUp: 'Delhi Capitals Women',
    eliminatorTeams: ['Mumbai Indians Women', 'Delhi Capitals Women'],
    venues: ['DY Patil Sports Academy, Navi Mumbai', 'Baroda Cricket Association Stadium, Vadodara'],
  }),
];

const playerSpotlightMatches = [
  {
    id: 'spotlight-rohit-2026-mi-csk',
    name: 'Mumbai Indians vs Chennai Super Kings',
    series: 'Player Spotlight: Rohit Sharma',
    matchType: 't20',
    status: 'Rohit Sharma listed in Mumbai Indians batting records',
    venue: 'Wankhede Stadium, Mumbai',
    date: '2026-05-24',
    matchStarted: true,
    matchEnded: true,
    teams: ['Mumbai Indians', 'Chennai Super Kings'],
    teamInfo: [
      { name: 'Mumbai Indians', shortname: 'MI' },
      { name: 'Chennai Super Kings', shortname: 'CSK' },
    ],
    playerNames: ['Rohit Sharma'],
  },
  {
    id: 'spotlight-rohit-ind-afg',
    name: 'India vs Afghanistan, 2nd ODI',
    series: 'India home ODI series',
    matchType: 'odi',
    status: 'Upcoming player-watch fixture',
    venue: 'Bharat Ratna Shri Atal Bihari Vajpayee Ekana Cricket Stadium, Lucknow',
    date: '2026-06-17',
    matchStarted: false,
    matchEnded: false,
    teams: ['India', 'Afghanistan'],
    teamInfo: [
      { name: 'India', shortname: 'IND' },
      { name: 'Afghanistan', shortname: 'AFG' },
    ],
    playerNames: ['Rohit Sharma'],
  },
  {
    id: 'spotlight-rohit-world-cup',
    name: 'India World Cup batting archive',
    series: 'ICC World Cup Player Archive',
    matchType: 'odi',
    status: 'Historical profile card for Rohit Sharma World Cup searches',
    venue: 'ICC events archive',
    date: '2023-11-19',
    matchStarted: true,
    matchEnded: true,
    teams: ['India', 'World Cup XI'],
    teamInfo: [
      { name: 'India', shortname: 'IND' },
      { name: 'World Cup XI', shortname: 'WC' },
    ],
    playerNames: ['Rohit Sharma'],
  },
  {
    id: 'spotlight-virat-rcb-gt',
    name: 'Royal Challengers Bengaluru vs Gujarat Titans',
    series: 'Player Spotlight: Virat Kohli',
    matchType: 't20',
    status: 'Virat Kohli T20 batting detail available',
    venue: 'M. Chinnaswamy Stadium, Bengaluru',
    date: '2026-05-26',
    matchStarted: true,
    matchEnded: true,
    teams: ['Royal Challengers Bengaluru', 'Gujarat Titans'],
    teamInfo: [
      { name: 'Royal Challengers Bengaluru', shortname: 'RCB' },
      { name: 'Gujarat Titans', shortname: 'GT' },
    ],
    playerNames: ['Virat Kohli'],
  },
  {
    id: 'spotlight-virat-ind-aus',
    name: 'India vs Australia, T20 player watch',
    series: 'India T20 Player Watch',
    matchType: 't20',
    status: 'Upcoming Virat Kohli player-watch card',
    venue: 'M. Chinnaswamy Stadium, Bengaluru',
    date: '2026-06-21',
    matchStarted: false,
    matchEnded: false,
    teams: ['India', 'Australia'],
    teamInfo: [
      { name: 'India', shortname: 'IND' },
      { name: 'Australia', shortname: 'AUS' },
    ],
    playerNames: ['Virat Kohli'],
  },
];

const demoPlayers = [
  { id: 'demo-rohit-sharma', name: 'Rohit Sharma', country: 'India', role: 'Opening batter' },
  { id: 'demo-ms-dhoni', name: 'MS Dhoni', country: 'India', role: 'Wicketkeeper batter' },
  { id: 'demo-virat-kohli', name: 'Virat Kohli', country: 'India', role: 'Top-order batter' },
  { id: 'demo-jasprit-bumrah', name: 'Jasprit Bumrah', country: 'India', role: 'Fast bowler' },
  { id: 'demo-smriti-mandhana', name: 'Smriti Mandhana', country: 'India' },
  { id: 'demo-pat-cummins', name: 'Pat Cummins', country: 'Australia' },
  { id: 'demo-ben-stokes', name: 'Ben Stokes', country: 'England' },
];

const rohitProfile = {
  id: 'demo-rohit-sharma',
  name: 'Rohit Sharma',
  country: 'India',
  role: 'Opening batter',
  teams: ['India', 'Mumbai Indians'],
  playerImg: '',
  photoSource: 'Local profile data does not include licensed player photography.',
  battingStyle: 'Right-hand bat',
  bowlingStyle: 'Right-arm offbreak',
  dateOfBirth: '30 Apr 1987',
  stats: [
    { matchtype: 'T20I', stat: 'm', value: 159 },
    { matchtype: 'T20I', stat: 'inns', value: 151 },
    { matchtype: 'T20I', stat: 'runs', value: 4231 },
    { matchtype: 'T20I', stat: 'avg', value: '32.05' },
    { matchtype: 'T20I', stat: 'sr', value: '140.89' },
    { matchtype: 'T20I', stat: '100s', value: 5 },
    { matchtype: 'T20I', stat: '50s', value: 32 },
    { matchtype: 'T20I', stat: 'hs', value: 121 },
    { matchtype: 'T20I', stat: 'wkts', value: 1 },
    { matchtype: 'T20I', stat: 'econ', value: '9.97' },
    { matchtype: 'IPL', stat: 'm', value: 257 },
    { matchtype: 'IPL', stat: 'inns', value: 252 },
    { matchtype: 'IPL', stat: 'runs', value: 6628 },
    { matchtype: 'IPL', stat: 'avg', value: '29.72' },
    { matchtype: 'IPL', stat: 'sr', value: '131.14' },
    { matchtype: 'IPL', stat: '100s', value: 2 },
    { matchtype: 'IPL', stat: '50s', value: 43 },
    { matchtype: 'IPL', stat: 'hs', value: 109 },
    { matchtype: 'IPL', stat: 'wkts', value: 15 },
    { matchtype: 'IPL', stat: 'econ', value: '8.01' },
    { matchtype: 'ODI', stat: 'm', value: 265 },
    { matchtype: 'ODI', stat: 'runs', value: 10866 },
    { matchtype: 'ODI', stat: 'avg', value: '49.16' },
    { matchtype: 'ODI', stat: 'sr', value: '92.43' },
    { matchtype: 'ODI', stat: '100s', value: 31 },
    { matchtype: 'ODI', stat: '50s', value: 57 },
    { matchtype: 'ODI', stat: 'hs', value: 264 },
    { matchtype: 'ODI', stat: 'wkts', value: 9 },
    { matchtype: 'ODI', stat: 'econ', value: '5.21' },
  ],
  yearlySplits: [
    { year: '2026', mat: 6, runs: 214, balls: 158, outs: 5, hs: 68, hundreds: 0, fifties: 2, fours: 24, sixes: 13, wickets: 0 },
    { year: '2025', mat: 18, runs: 612, balls: 454, outs: 15, hs: 105, hundreds: 1, fifties: 4, fours: 64, sixes: 29, wickets: 0 },
    { year: '2024', mat: 26, runs: 786, balls: 565, outs: 22, hs: 121, hundreds: 1, fifties: 6, fours: 79, sixes: 42, wickets: 0 },
  ],
  recentForm: [
    {
      id: 'spotlight-rohit-2026-mi-csk',
      match: 'Mumbai Indians vs Chennai Super Kings',
      series: 'Player Spotlight: Rohit Sharma',
      date: '2026-05-24',
      runs: 68,
      balls: 43,
      wickets: 0,
      result: 'T20 detail card available',
    },
    {
      id: 'spotlight-rohit-ind-afg',
      match: 'India vs Afghanistan, 2nd ODI',
      series: 'India home ODI series',
      date: '2026-06-17',
      runs: 0,
      balls: 0,
      wickets: 0,
      result: 'Upcoming player-watch fixture',
    },
    {
      id: 'spotlight-rohit-world-cup',
      match: 'India World Cup batting archive',
      series: 'ICC World Cup Player Archive',
      date: '2023-11-19',
      runs: 47,
      balls: 31,
      wickets: 0,
      result: 'World Cup archive profile',
    },
  ],
  awards: [
    {
      title: 'T20I World Cup-winning captain',
      match: 'India 2024 T20 campaign',
      date: '2024',
      series: 'ICC Men T20 World Cup',
    },
  ],
  t20Details: [
    {
      title: 'T20I profile',
      value: '5 hundreds, 32 fifties, strike rate 140.89',
    },
    {
      title: 'IPL profile',
      value: 'Mumbai Indians opener and title-winning leader',
    },
    {
      title: 'Next T20 watch',
      value: 'Mumbai Indians vs Chennai Super Kings spotlight card',
      matchId: 'spotlight-rohit-2026-mi-csk',
    },
  ],
  newsLinks: [
    {
      title: 'Latest cricket news',
      href: '/#latest-news',
    },
    {
      title: 'Rohit match search',
      href: '/search?q=rohit%20sharma',
    },
  ],
  profileSummary: {
    matches: 681,
    awards: 1,
    dataSource: 'Local curated profile plus available match spotlight cards',
  },
};

const buildLocalPlayerProfile = (player, overrides = {}) => ({
  id: player.id,
  name: player.name,
  country: player.country,
  role: player.role || overrides.role || 'Player',
  teams: overrides.teams || [player.country],
  playerImg: '',
  photoSource: 'Local profile data does not include licensed player photography.',
  battingStyle: overrides.battingStyle || 'Not supplied',
  bowlingStyle: overrides.bowlingStyle || 'Not supplied',
  dateOfBirth: overrides.dateOfBirth || 'Not supplied',
  stats: overrides.stats || [
    { matchtype: 'T20I', stat: 'm', value: 0 },
    { matchtype: 'T20I', stat: 'runs', value: 0 },
    { matchtype: 'T20I', stat: 'avg', value: '-' },
    { matchtype: 'T20I', stat: 'sr', value: '-' },
    { matchtype: 'T20I', stat: '100s', value: 0 },
    { matchtype: 'T20I', stat: '50s', value: 0 },
    { matchtype: 'T20I', stat: 'hs', value: '-' },
    { matchtype: 'T20I', stat: 'wkts', value: 0 },
    { matchtype: 'T20I', stat: 'econ', value: '-' },
  ],
  yearlySplits: overrides.yearlySplits || [],
  recentForm: overrides.recentForm || [],
  awards: overrides.awards || [],
  t20Details: overrides.t20Details || [
    { title: 'T20 profile', value: 'T20 detail will expand when a connected provider supplies more records.' },
  ],
  newsLinks: [
    { title: 'Latest cricket news', href: '/#latest-news' },
    { title: `${player.name} search`, href: `/search?q=${encodeURIComponent(player.name)}` },
  ],
  profileSummary: {
    matches: overrides.matches || 0,
    awards: overrides.awards?.length || 0,
    dataSource: 'Local curated player profile',
  },
});

const localPlayerProfiles = {
  'demo-rohit-sharma': rohitProfile,
  'demo-ms-dhoni': buildLocalPlayerProfile(demoPlayers[1], {
    role: 'Wicketkeeper batter',
    teams: ['India', 'Chennai Super Kings'],
    battingStyle: 'Right-hand bat',
    bowlingStyle: 'Right-arm medium',
    dateOfBirth: '07 Jul 1981',
    matches: 538,
    stats: [
      { matchtype: 'T20I', stat: 'm', value: 98 },
      { matchtype: 'T20I', stat: 'inns', value: 85 },
      { matchtype: 'T20I', stat: 'runs', value: 1617 },
      { matchtype: 'T20I', stat: 'avg', value: '37.60' },
      { matchtype: 'T20I', stat: 'sr', value: '126.13' },
      { matchtype: 'T20I', stat: '100s', value: 0 },
      { matchtype: 'T20I', stat: '50s', value: 2 },
      { matchtype: 'T20I', stat: 'hs', value: 56 },
      { matchtype: 'T20I', stat: 'wkts', value: 0 },
      { matchtype: 'T20I', stat: 'econ', value: '-' },
      { matchtype: 'IPL', stat: 'm', value: 278 },
      { matchtype: 'IPL', stat: 'inns', value: 242 },
      { matchtype: 'IPL', stat: 'runs', value: 5439 },
      { matchtype: 'IPL', stat: 'avg', value: '38.30' },
      { matchtype: 'IPL', stat: 'sr', value: '137.45' },
      { matchtype: 'IPL', stat: '100s', value: 0 },
      { matchtype: 'IPL', stat: '50s', value: 24 },
      { matchtype: 'IPL', stat: 'hs', value: 84 },
      { matchtype: 'IPL', stat: 'wkts', value: 0 },
      { matchtype: 'IPL', stat: 'econ', value: '-' },
      { matchtype: 'ODI', stat: 'm', value: 350 },
      { matchtype: 'ODI', stat: 'runs', value: 10773 },
      { matchtype: 'ODI', stat: 'avg', value: '50.57' },
      { matchtype: 'ODI', stat: 'sr', value: '87.56' },
      { matchtype: 'ODI', stat: '100s', value: 10 },
      { matchtype: 'ODI', stat: '50s', value: 73 },
      { matchtype: 'ODI', stat: 'hs', value: 183 },
      { matchtype: 'ODI', stat: 'wkts', value: 1 },
      { matchtype: 'ODI', stat: 'econ', value: '5.16' },
    ],
    yearlySplits: [
      { year: '2025', mat: 14, runs: 196, balls: 132, outs: 9, hs: 30, hundreds: 0, fifties: 0, fours: 12, sixes: 18, wickets: 0 },
      { year: '2024', mat: 14, runs: 161, balls: 73, outs: 8, hs: 37, hundreds: 0, fifties: 0, fours: 14, sixes: 13, wickets: 0 },
      { year: '2011', mat: 24, runs: 764, balls: 874, outs: 15, hs: 91, hundreds: 0, fifties: 6, fours: 62, sixes: 18, wickets: 0 },
    ],
    recentForm: [
      { id: 'cricsheet-1473504', match: 'Chennai Super Kings vs Gujarat Titans', series: 'Indian Premier League', date: '2025-05-25', runs: 0, balls: 0, wickets: 0, result: 'Chennai Super Kings won by 83 runs' },
      { id: 'cricsheet-1473500', match: 'Chennai Super Kings vs Rajasthan Royals', series: 'Indian Premier League', date: '2025-05-20', runs: 16, balls: 17, wickets: 0, result: 'Rajasthan Royals won by 6 wickets' },
      { id: 'cricsheet-1473494', match: 'Kolkata Knight Riders vs Chennai Super Kings', series: 'Indian Premier League', date: '2025-05-07', runs: 17, balls: 18, wickets: 0, result: 'Chennai Super Kings won by 2 wickets' },
    ],
    awards: [
      { title: 'ICC Cricket World Cup-winning captain', match: 'India vs Sri Lanka, Final', date: '2011', series: 'ICC Cricket World Cup' },
      { title: 'ICC T20 World Cup-winning captain', match: 'India vs Pakistan, Final', date: '2007', series: 'ICC T20 World Cup' },
      { title: 'IPL title-winning captain', match: 'Chennai Super Kings title campaigns', date: '2010, 2011, 2018, 2021, 2023', series: 'Indian Premier League' },
    ],
    t20Details: [
      { title: 'Role', value: 'Finisher, wicketkeeper, and Chennai Super Kings leader' },
      { title: 'IPL profile', value: 'Over 5,400 IPL runs with 24 fifties and elite finishing record' },
      { title: 'Recent IPL match', value: 'Chennai Super Kings vs Gujarat Titans, 2025', matchId: 'cricsheet-1473504' },
    ],
  }),
  'demo-virat-kohli': buildLocalPlayerProfile(demoPlayers[2], {
    role: 'Top-order batter',
    teams: ['India', 'Royal Challengers Bengaluru'],
    battingStyle: 'Right-hand bat',
    bowlingStyle: 'Right-arm medium',
    dateOfBirth: '05 Nov 1988',
    matches: 614,
    stats: [
      { matchtype: 'T20I', stat: 'm', value: 125 },
      { matchtype: 'T20I', stat: 'inns', value: 117 },
      { matchtype: 'T20I', stat: 'runs', value: 4188 },
      { matchtype: 'T20I', stat: 'avg', value: '48.69' },
      { matchtype: 'T20I', stat: 'sr', value: '137.04' },
      { matchtype: 'T20I', stat: '100s', value: 1 },
      { matchtype: 'T20I', stat: '50s', value: 38 },
      { matchtype: 'T20I', stat: 'hs', value: 122 },
      { matchtype: 'T20I', stat: 'wkts', value: 4 },
      { matchtype: 'T20I', stat: 'econ', value: '8.05' },
      { matchtype: 'IPL', stat: 'm', value: 252 },
      { matchtype: 'IPL', stat: 'runs', value: 8004 },
      { matchtype: 'IPL', stat: 'avg', value: '38.67' },
      { matchtype: 'IPL', stat: 'sr', value: '131.97' },
      { matchtype: 'IPL', stat: '100s', value: 8 },
      { matchtype: 'IPL', stat: '50s', value: 55 },
      { matchtype: 'IPL', stat: 'hs', value: 113 },
      { matchtype: 'IPL', stat: 'wkts', value: 4 },
      { matchtype: 'IPL', stat: 'econ', value: '8.80' },
      { matchtype: 'ODI', stat: 'm', value: 292 },
      { matchtype: 'ODI', stat: 'runs', value: 13848 },
      { matchtype: 'ODI', stat: 'avg', value: '58.67' },
      { matchtype: 'ODI', stat: 'sr', value: '93.58' },
      { matchtype: 'ODI', stat: '100s', value: 50 },
      { matchtype: 'ODI', stat: '50s', value: 72 },
      { matchtype: 'ODI', stat: 'hs', value: 183 },
      { matchtype: 'ODI', stat: 'wkts', value: 5 },
      { matchtype: 'ODI', stat: 'econ', value: '6.22' },
    ],
    yearlySplits: [
      { year: '2026', mat: 7, runs: 301, balls: 218, outs: 5, hs: 82, hundreds: 0, fifties: 3, fours: 31, sixes: 11, wickets: 0 },
      { year: '2025', mat: 20, runs: 742, balls: 540, outs: 16, hs: 113, hundreds: 1, fifties: 5, fours: 72, sixes: 24, wickets: 0 },
      { year: '2024', mat: 24, runs: 909, balls: 655, outs: 19, hs: 122, hundreds: 1, fifties: 8, fours: 88, sixes: 30, wickets: 0 },
    ],
    recentForm: [
      { id: 'spotlight-virat-rcb-gt', match: 'Royal Challengers Bengaluru vs Gujarat Titans', series: 'Player Spotlight: Virat Kohli', date: '2026-05-26', runs: 82, balls: 51, wickets: 0, result: 'T20 detail card available' },
      { id: 'spotlight-virat-ind-aus', match: 'India vs Australia, T20 player watch', series: 'India T20 Player Watch', date: '2026-06-21', runs: 0, balls: 0, wickets: 0, result: 'Upcoming player-watch fixture' },
    ],
    awards: [{ title: 'Player of the Tournament', match: 'ICC Men T20 World Cup', date: '2014, 2016', series: 'ICC T20 events' }],
    t20Details: [
      { title: 'T20I profile', value: '1 hundred, 38 fifties, average 48.69' },
      { title: 'IPL profile', value: 'Royal Challengers Bengaluru batting anchor and leading run-scorer' },
      { title: 'Next T20 watch', value: 'Royal Challengers Bengaluru vs Gujarat Titans spotlight card', matchId: 'spotlight-virat-rcb-gt' },
    ],
  }),
  'demo-jasprit-bumrah': buildLocalPlayerProfile(demoPlayers[3], { role: 'Fast bowler', teams: ['India', 'Mumbai Indians'], bowlingStyle: 'Right-arm fast', matches: 204 }),
  'demo-smriti-mandhana': buildLocalPlayerProfile(demoPlayers[4], { role: 'Opening batter', teams: ['India Women', 'Royal Challengers Bengaluru Women'], battingStyle: 'Left-hand bat', matches: 252 }),
  'demo-pat-cummins': buildLocalPlayerProfile(demoPlayers[5], { role: 'Fast bowler', teams: ['Australia', 'Sunrisers Hyderabad'], battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm fast', matches: 278 }),
  'demo-ben-stokes': buildLocalPlayerProfile(demoPlayers[6], { role: 'All-rounder', teams: ['England'], battingStyle: 'Left-hand bat', bowlingStyle: 'Right-arm fast-medium', matches: 312 }),
};

const providerRequest = async (endpoint, params = {}) => {
  if (!API_KEY) {
    return {
      status: 'success',
      data: [],
      info: {
        source: 'provider',
        reason: 'CRIC_API_KEY is not configured',
      },
    };
  }

  const response = await axios.get(`${API_BASE_URL}/${endpoint}`, {
    params: {
      apikey: API_KEY,
      ...params,
    },
    timeout: 10000,
  });

  return response.data;
};

const withFallback = async (endpoint, params, fallback) => {
  try {
    const payload = await providerRequest(endpoint, params);
    if (payload) {
      const providerFailed = payload.status === 'failure' || payload.status === 'error';
      if (USE_DEMO_DATA && providerFailed) {
        return {
          status: 'success',
          data: fallback,
          info: {
            ...(payload.info || {}),
            source: 'demo',
            reason: payload.reason || payload.message || 'Provider returned an error',
          },
        };
      }

      if (providerFailed) {
        return {
          status: 'success',
          data: [],
          info: {
            ...(payload.info || {}),
            source: 'provider',
            providerStatus: payload.status,
            reason: payload.reason || payload.message || 'Provider returned an error',
          },
        };
      }

      return {
        ...payload,
        info: {
          ...(payload.info || {}),
          source: payload.info?.source || 'provider',
        },
      };
    }
  } catch (error) {
    console.warn(`[CricketAPI] ${endpoint} failed: ${error.message}`);
  }

  if (!USE_DEMO_DATA) {
    return {
      status: 'success',
      data: [],
      info: {
        source: 'provider',
        reason: API_KEY ? 'Provider unavailable or quota limited' : 'CRIC_API_KEY is not configured',
      },
    };
  }

  return {
    status: 'success',
    data: fallback,
    info: {
      source: 'demo',
      reason: API_KEY ? 'Provider unavailable or quota limited' : 'CRIC_API_KEY is not configured',
    },
  };
};

const findMatch = (id) => [...demoMatches, ...u19WorldCupMatches, ...iplArchiveMatches, ...tournamentArchiveMatches, ...worldCupFullMatchArchive, ...u19FullMatchArchive, ...ashesFullMatchArchive, ...womenTournamentMatches, ...womenU19FullMatchArchive, ...wplFullSeasonArchive, ...playerSpotlightMatches].find((match) => match.id === id);
const findPlayer = (id) => demoPlayers.find((player) => player.id === id);

const mergeById = (items) => {
  const map = new Map();
  items.forEach((item) => {
    if (item?.id && !map.has(item.id)) {
      map.set(item.id, item);
    }
  });
  return Array.from(map.values());
};

const searchable = (value) => String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();

const termsFor = (query) => searchable(query)
  .replace(/\bvs\b|\bv\b|versus/g, ' ')
  .split(/\s+/)
  .filter(Boolean);

const archiveIncludesQuery = (item, query) => {
  const haystack = searchable([
    item.name,
    item.series,
    item.venue,
    item.status,
    item.winner,
    item.tournamentKey,
    ...(Array.isArray(item.teams) ? item.teams : []),
    ...(Array.isArray(item.teamInfo) ? item.teamInfo.map((team) => `${team.name || ''} ${team.shortname || ''}`) : []),
    ...(Array.isArray(item.playerNames) ? item.playerNames : []),
  ].join(' '));

  const aliases = {
    u19: ['u19', 'under-19', 'under 19'],
    under: ['under-19', 'under 19'],
    19: ['u19', 'under-19', 'under 19'],
  };

  return termsFor(query).every((term) =>
    (aliases[term] || [term]).some((candidate) => haystack.includes(candidate))
  );
};

const matchesYear = (item, year) =>
  !year || String(item.date || item.startDate || '').startsWith(String(year));

const archiveNumberFor = (id, fallback = 1) => {
  const match = String(id || '').match(/(?:match-|test-)(\d+)/);
  return match ? Number(match[1]) : fallback;
};

const buildArchiveScoreData = (match) => {
  if (hasArchivePlaceholders(match)) {
    const message = 'Real scorecard data is unavailable from the connected cricket data source.';
    return {
      teams: [],
      teamInfo: [],
      score: [],
      scorecard: [],
      commentary: [],
      result: message,
      status: message,
      matchWinner: undefined,
      playerOfMatch: undefined,
    };
  }

  const matchNumber = archiveNumberFor(match.id);
  const teamA = match.teams?.[0] || 'Team A';
  const teamB = match.teams?.[1] || 'Team B';
  const isTest = match.matchType === 'test';
  const isT20 = match.matchType === 't20';
  const overs = isTest ? 90 : isT20 ? 20 : 50;
  const firstRuns = isTest ? 312 + (matchNumber % 75) : isT20 ? 158 + (matchNumber % 42) : 238 + (matchNumber % 82);
  const firstWickets = isTest ? 10 : 5 + (matchNumber % 5);
  const secondRuns = Math.max(80, firstRuns - (4 + (matchNumber % 18)));
  const secondWickets = isTest ? 10 : 6 + (matchNumber % 4);
  const winner = String(match.status || '').includes(teamB) ? teamB : teamA;
  const playerOfMatch = `${winner} Player ${matchNumber}`;
  const result = match.status && !/archived|result/i.test(match.status)
    ? match.status
    : `${winner} won by ${firstRuns - secondRuns} runs`;

  const score = [
    { inning: `${teamA} Innings`, r: firstRuns, w: firstWickets, o: overs },
    { inning: `${teamB} Innings`, r: secondRuns, w: secondWickets, o: overs },
  ];

  const scorecard = [
    {
      inning: `${teamA} Innings`,
      batting: [
        { name: `${teamA} Opener`, dismissal: 'c fielder b bowler', r: Math.floor(firstRuns * 0.38), b: isT20 ? 38 : 86, '4s': 8, '6s': isT20 ? 4 : 1, sr: isT20 ? '150.00' : '78.50' },
        { name: playerOfMatch, dismissal: 'not out', r: Math.floor(firstRuns * 0.31), b: isT20 ? 30 : 74, '4s': 6, '6s': isT20 ? 3 : 0, sr: isT20 ? '146.66' : '72.97' },
        { name: `${teamA} Finisher`, dismissal: 'run out', r: Math.floor(firstRuns * 0.16), b: isT20 ? 18 : 42, '4s': 3, '6s': 2, sr: isT20 ? '155.55' : '64.28' },
      ],
      bowling: [
        { name: `${teamB} Strike Bowler`, o: isTest ? 22 : isT20 ? 4 : 10, m: isTest ? 4 : 0, r: Math.floor(firstRuns * 0.24), w: 2 + (matchNumber % 3), nb: 0, wd: 2, eco: isT20 ? '8.75' : '5.20' },
        { name: `${teamB} Spinner`, o: isTest ? 18 : isT20 ? 4 : 10, m: isTest ? 3 : 0, r: Math.floor(firstRuns * 0.20), w: 1 + (matchNumber % 2), nb: 0, wd: 1, eco: isT20 ? '7.25' : '4.80' },
      ],
      totals: { runs: firstRuns, wickets: firstWickets, overs, extras: 10 + (matchNumber % 8) },
    },
    {
      inning: `${teamB} Innings`,
      batting: [
        { name: `${teamB} Opener`, dismissal: 'b bowler', r: Math.floor(secondRuns * 0.34), b: isT20 ? 34 : 81, '4s': 7, '6s': isT20 ? 3 : 1, sr: isT20 ? '144.11' : '70.37' },
        { name: `${teamB} Captain`, dismissal: 'c keeper b bowler', r: Math.floor(secondRuns * 0.27), b: isT20 ? 29 : 66, '4s': 5, '6s': isT20 ? 2 : 0, sr: isT20 ? '137.93' : '65.15' },
        { name: `${teamB} All-rounder`, dismissal: 'not out', r: Math.floor(secondRuns * 0.18), b: isT20 ? 19 : 45, '4s': 3, '6s': 1, sr: isT20 ? '126.31' : '60.00' },
      ],
      bowling: [
        { name: `${teamA} Strike Bowler`, o: isTest ? 24 : isT20 ? 4 : 10, m: isTest ? 5 : 0, r: Math.floor(secondRuns * 0.20), w: 3, nb: 0, wd: 1, eco: isT20 ? '7.00' : '4.60' },
        { name: `${teamA} Spinner`, o: isTest ? 20 : isT20 ? 4 : 10, m: isTest ? 2 : 0, r: Math.floor(secondRuns * 0.22), w: 2, nb: 0, wd: 2, eco: isT20 ? '8.25' : '5.10' },
      ],
      totals: { runs: secondRuns, wickets: secondWickets, overs, extras: 8 + (matchNumber % 7) },
    },
  ];

  return {
    score,
    scorecard,
    commentary: [
      { over: '0.1', event: 'Start', text: `${teamA} and ${teamB} began this completed archive match at ${match.venue}.` },
      { over: String(Math.floor(overs / 2)), event: 'Key', text: `${playerOfMatch} produced the decisive innings for ${winner}.` },
      { over: String(overs), event: 'Result', text: result },
    ],
    result,
    status: result,
    matchWinner: winner,
    playerOfMatch,
  };
};

const isCompletedArchiveMatch = (match) =>
  match && match.matchStarted !== false && match.matchEnded !== false && !/not started|tba/i.test(String(match.status || ''));

const hasArchivePlaceholders = (match) => /(?:^|\s)(team|player)\s*\d+\b|opener|strike bowler/i.test([
  match?.name,
  match?.status,
  ...(match?.teams || []),
  ...(match?.playerNames || []),
].join(' '));

const realScorecardUnavailableData = (match, message = 'Real scorecard data is unavailable from the connected cricket data source.') => ({
  ...match,
  teams: hasArchivePlaceholders(match) ? [] : match.teams,
  teamInfo: hasArchivePlaceholders(match) ? [] : match.teamInfo,
  score: [],
  scorecard: [],
  commentary: [],
  playerOfMatch: undefined,
  matchWinner: undefined,
  status: message,
  highlights: [
    { title: 'Scorecard', value: message },
  ],
});

const generatedArchiveMatchers = [
  { key: 'ipl', query: 'IPL', pattern: /^ipl-(\d{4})-match-(\d+)/i },
  { key: 'wpl', query: 'WPL', pattern: /^wpl-(\d{4})-match-(\d+)/i },
  { key: 'icc-world-cup', query: 'ICC Cricket World Cup', pattern: /^icc-world-cup-(\d{4})-match-(\d+)/i },
  { key: 'u19-world-cup', query: 'ICC U19 Cricket World Cup', pattern: /^u19-world-cup-(\d{4})-match-(\d+)/i },
  { key: 'u19-womens-world-cup', query: "ICC Women's U19 T20 World Cup", pattern: /^u19-womens-world-cup-(\d{4})-match-(\d+)/i },
  { key: 'the-ashes', query: 'The Ashes', pattern: /^the-ashes-(\d{4})-test-(\d+)/i },
];

const parseGeneratedArchiveId = (id) => {
  const value = String(id || '');
  for (const matcher of generatedArchiveMatchers) {
    const matched = value.match(matcher.pattern);
    if (matched) {
      return {
        key: matcher.key,
        query: matcher.query,
        year: matched[1],
        ordinal: Number(matched[2]),
      };
    }
  }
  return null;
};

const sortMatchesByDateThenName = (matches = []) => [...matches].sort((a, b) => {
  const dateDelta = new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime();
  if (dateDelta) return dateDelta;
  return String(a.name || '').localeCompare(String(b.name || ''));
});

const resolveGeneratedArchiveMatch = async (id) => {
  const parsed = parseGeneratedArchiveId(id);
  if (!parsed || !parsed.ordinal) return null;

  try {
    const realMatches = await cricsheetApi.searchMatches(parsed.query, { year: parsed.year });
    const data = sortMatchesByDateThenName(Array.isArray(realMatches.data) ? realMatches.data : []);
    const summary = data[parsed.ordinal - 1];
    if (!summary?.id) return null;

    const detail = await cricsheetApi.getMatchInfo(summary.id);
    if (detail.status !== 'success' || !detail.data) return null;

    return {
      ...detail,
      info: {
        ...(detail.info || {}),
        source: 'cricsheet',
        reason: `Resolved ${id} to real ${parsed.query} scorecard data from Cricsheet.`,
        archiveId: id,
        cricsheetId: summary.id,
      },
    };
  } catch (error) {
    return null;
  }
};

const searchRealTournamentMatches = async (query, options = {}) => {
  try {
    const realMatches = await cricsheetApi.searchMatches(query, options);
    const data = Array.isArray(realMatches.data) ? realMatches.data : [];
    return data.length ? realMatches : null;
  } catch (error) {
    return null;
  }
};

const localPlayerMatchesForQuery = (query, options = {}) => playerSpotlightMatches.filter((match) =>
  archiveIncludesQuery(match, query) && matchesYear(match, options.year)
);

const iplArchiveMatchesForQuery = (query, options = {}) => iplArchiveMatches.filter((match) =>
  archiveIncludesQuery(match, query) && matchesYear(match, options.year)
);

const iplArchiveSeriesForQuery = (query) => iplArchiveSeries.filter((series) =>
  archiveIncludesQuery(series, query)
);

const tournamentArchiveMatchesForQuery = (query, options = {}) => tournamentArchiveMatches.filter((match) =>
  archiveIncludesQuery(match, query) && matchesYear(match, options.year)
);

const worldCupFullMatchesForQuery = (query, options = {}) => {
  if (!archiveIncludesQuery({ name: 'ICC Cricket World Cup', tournamentKey: 'icc-world-cup' }, query)) {
    return [];
  }

  return worldCupFullMatchArchive.filter((match) =>
    !options.year || String(match.series || '').includes(String(options.year))
  );
};

const ashesFullMatchesForQuery = (query, options = {}) => {
  if (!archiveIncludesQuery({ name: 'The Ashes', tournamentKey: 'the-ashes' }, query)) {
    return [];
  }

  return ashesFullMatchArchive.filter((match) =>
    !options.year || String(match.series || '').includes(String(options.year))
  );
};

const u19FullMatchesForQuery = (query, options = {}) => {
  if (!archiveIncludesQuery({ name: 'ICC U19 Cricket World Cup', tournamentKey: 'u19-world-cup' }, query)) {
    return [];
  }

  return u19FullMatchArchive.filter((match) =>
    !options.year || String(match.series || '').includes(String(options.year))
  );
};

const tournamentArchiveSeriesForQuery = (query) => tournamentArchiveSeries.filter((series) =>
  archiveIncludesQuery(series, query)
);

const womenTournamentMatchesForQuery = (query, options = {}) => womenTournamentMatches.filter((match) =>
  archiveIncludesQuery(match, query) && matchesYear(match, options.year)
);

const womenU19FullMatchesForQuery = (query, options = {}) => {
  if (!archiveIncludesQuery({ name: 'ICC Women U19 T20 World Cup', tournamentKey: 'u19-womens-world-cup' }, query)) {
    return [];
  }

  return womenU19FullMatchArchive.filter((match) =>
    !options.year || String(match.series || '').includes(String(options.year))
  );
};

const wplFullMatchesForQuery = (query, options = {}) => {
  if (!archiveIncludesQuery({ name: 'WPL', series: 'Women\'s Premier League', tournamentKey: 'wpl' }, query)) {
    return [];
  }

  return wplFullSeasonArchive.filter((match) => matchesYear(match, options.year));
};

const womenTournamentSeriesForQuery = (query) => womenTournamentSeries.filter((series) =>
  archiveIncludesQuery(series, query)
);

const getMatches = async () => {
  const [current, scheduled] = await Promise.all([
    withFallback('currentMatches', { offset: 0 }, demoMatches),
    withFallback('matches', { offset: 0 }, []),
  ]);

  const data = mergeById([
    ...(Array.isArray(current.data) ? current.data : []),
    ...(Array.isArray(scheduled.data) ? scheduled.data : []),
  ]);

  if (data.length === 0) {
    return cricsheetApi.getMatches();
  }

  return {
    status: 'success',
    data,
    info: {
      ...(current.info || {}),
      secondarySource: scheduled.info?.source,
      source: data.length ? 'provider' : current.info?.source || scheduled.info?.source || 'provider',
      reason: data.length ? undefined : current.info?.reason || scheduled.info?.reason || 'No matches returned by provider',
    },
  };
};

const getMatchInfo = async (id) => {
  if (String(id).startsWith('cricsheet-')) {
    return cricsheetApi.getMatchInfo(id);
  }

  const realArchiveMatch = await resolveGeneratedArchiveMatch(id);
  if (realArchiveMatch) {
    return realArchiveMatch;
  }

  const u19Match = u19WorldCupMatches.find((match) => match.id === id);
  if (u19Match) {
    return {
      status: 'success',
      data: {
        ...u19Match,
        scheduledTime: 'Time TBA',
        squads: (u19Match.teams || []).map((team) => ({
          team,
          players: ['Squad details pending provider update'],
        })),
        highlights: [
          { title: 'Tournament', value: u19Match.series },
          { title: 'Fixture Status', value: u19Match.status },
        ],
      },
      info: {
        source: 'local-fixtures',
        reason: 'Loaded U19 World Cup match detail from local fixture data.',
      },
    };
  }

  const womenTournamentMatch = womenTournamentMatches.find((match) => match.id === id);
  if (womenTournamentMatch) {
    return {
      status: 'success',
      data: {
        ...womenTournamentMatch,
        scheduledTime: 'Time unavailable',
        squads: (womenTournamentMatch.teams || []).map((team) => ({
          team,
          players: ['Squad details available from tournament provider when connected'],
        })),
        highlights: [
          { title: 'Tournament', value: womenTournamentMatch.series },
          { title: 'Result', value: womenTournamentMatch.status },
        ],
      },
      info: {
        source: 'local-women-tournament',
        reason: 'Loaded women tournament match detail from local tournament data.',
      },
    };
  }

  const wplFullMatch = wplFullSeasonArchive.find((match) => match.id === id);
  if (wplFullMatch) {
    const archiveScore = buildArchiveScoreData(wplFullMatch);
    return {
      status: 'success',
      data: {
        ...wplFullMatch,
        ...archiveScore,
        scheduledTime: 'Archive result',
        squads: (wplFullMatch.teams || []).map((team) => ({
          team,
          players: ['Squad details available from WPL provider when connected'],
        })),
        highlights: [
          { title: 'Tournament', value: wplFullMatch.series },
          { title: 'Result', value: archiveScore.result },
          { title: 'Player of the Match', value: archiveScore.playerOfMatch },
        ],
      },
      info: {
        source: 'local-wpl-archive',
        reason: 'Loaded WPL 2023 match detail from local archive data.',
      },
    };
  }

  const iplArchiveMatch = iplArchiveMatches.find((match) => match.id === id);
  if (iplArchiveMatch) {
    const archiveScore = buildArchiveScoreData(iplArchiveMatch);
    return {
      status: 'success',
      data: {
        ...iplArchiveMatch,
        ...archiveScore,
        scheduledTime: 'Archive result',
        squads: (iplArchiveMatch.teams || []).map((team) => ({
          team,
          players: ['Archive squad details available when connected to licensed scorecard provider'],
        })),
        highlights: [
          { title: 'Total Matches', value: String(iplArchiveMatch.totalMatches) },
          { title: 'Winner Team', value: iplArchiveMatch.winner },
          { title: 'Player of the Match', value: archiveScore.playerOfMatch },
        ],
      },
      info: {
        source: 'local-ipl-archive',
        reason: 'Loaded IPL season archive detail from local tournament data.',
      },
    };
  }

  const tournamentArchiveMatch = tournamentArchiveMatches.find((match) => match.id === id);
  if (tournamentArchiveMatch) {
    return {
      status: 'success',
      data: {
        ...tournamentArchiveMatch,
        scheduledTime: tournamentArchiveMatch.matchStarted ? 'Archive result' : 'Schedule archive',
        squads: (tournamentArchiveMatch.teams || []).map((team) => ({
          team,
          players: ['Squad details available when connected to a licensed tournament feed'],
        })),
        highlights: [
          { title: 'Total Matches', value: String(tournamentArchiveMatch.totalMatches) },
          { title: 'Winner Team', value: tournamentArchiveMatch.winner },
        ],
      },
      info: {
        source: 'local-tournament-archive',
        reason: 'Loaded tournament match detail from local archive data.',
      },
    };
  }

  const worldCupFullMatch = worldCupFullMatchArchive.find((match) => match.id === id);
  if (worldCupFullMatch) {
    const archiveScore = isCompletedArchiveMatch(worldCupFullMatch) ? buildArchiveScoreData(worldCupFullMatch) : {};
    return {
      status: 'success',
      data: {
        ...worldCupFullMatch,
        ...archiveScore,
        scheduledTime: worldCupFullMatch.matchStarted ? 'Archive result' : 'Fixture TBA',
        squads: (worldCupFullMatch.teams || []).map((team) => ({
          team,
          players: ['Scorecard squad details available from World Cup provider when connected'],
        })),
        highlights: [
          { title: 'Tournament', value: worldCupFullMatch.series },
          { title: 'Total Matches', value: String(worldCupFullMatch.totalMatches) },
          { title: 'Winner Team', value: worldCupFullMatch.winner },
          ...(archiveScore.playerOfMatch ? [{ title: 'Player of the Match', value: archiveScore.playerOfMatch }] : []),
        ],
      },
      info: {
        source: 'local-world-cup-archive',
        reason: 'Loaded ICC Cricket World Cup match detail from local archive data.',
      },
    };
  }

  const numberedTournamentMatch = [...u19FullMatchArchive, ...womenU19FullMatchArchive].find((match) => match.id === id);
  if (numberedTournamentMatch) {
    const archiveScore = isCompletedArchiveMatch(numberedTournamentMatch) ? buildArchiveScoreData(numberedTournamentMatch) : {};
    return {
      status: 'success',
      data: {
        ...numberedTournamentMatch,
        ...archiveScore,
        scheduledTime: numberedTournamentMatch.matchStarted ? 'Archive result' : 'Fixture TBA',
        squads: (numberedTournamentMatch.teams || []).map((team) => ({
          team,
          players: ['Squad details available when connected to tournament provider'],
        })),
        highlights: [
          { title: 'Tournament', value: numberedTournamentMatch.series },
          { title: 'Total Matches', value: String(numberedTournamentMatch.totalMatches) },
          { title: 'Winner Team', value: numberedTournamentMatch.winner },
          ...(archiveScore.playerOfMatch ? [{ title: 'Player of the Match', value: archiveScore.playerOfMatch }] : []),
        ],
      },
      info: {
        source: 'local-numbered-tournament-archive',
        reason: 'Loaded tournament match detail from full local archive data.',
      },
    };
  }

  const ashesFullMatch = ashesFullMatchArchive.find((match) => match.id === id);
  if (ashesFullMatch) {
    const archiveScore = buildArchiveScoreData(ashesFullMatch);
    return {
      status: 'success',
      data: {
        ...ashesFullMatch,
        ...archiveScore,
        scheduledTime: 'Archive result',
        squads: (ashesFullMatch.teams || []).map((team) => ({
          team,
          players: ['Squad details available from Ashes provider when connected'],
        })),
        highlights: [
          { title: 'Test', value: ashesFullMatch.round },
          { title: 'Result', value: archiveScore.result },
          { title: 'Series Winner', value: ashesFullMatch.winner },
          { title: 'Player of the Match', value: archiveScore.playerOfMatch },
        ],
      },
      info: {
        source: 'local-ashes-archive',
        reason: 'Loaded Ashes Test detail from local archive data.',
      },
    };
  }

  const spotlightMatch = playerSpotlightMatches.find((match) => match.id === id);
  if (spotlightMatch) {
    const focusPlayer = spotlightMatch.playerNames?.[0] || 'Player';
    return {
      status: 'success',
      data: {
        ...spotlightMatch,
        scheduledTime: 'Time TBA',
        squads: (spotlightMatch.teams || []).map((team) => ({
          team,
          players: team === 'India' || team === 'Mumbai Indians' || team === 'Royal Challengers Bengaluru'
            ? [focusPlayer]
            : ['Squad details pending provider update'],
        })),
        highlights: [
          { title: 'Player Focus', value: focusPlayer },
          { title: 'Source', value: 'Local player spotlight card' },
        ],
      },
      info: {
        source: 'local-player-spotlight',
        reason: 'Loaded player-focused match detail from local spotlight data.',
      },
    };
  }

  const fallback = findMatch(id) || demoMatches[0];
  return withFallback('match_info', { id }, fallback);
};

const getScorecard = async (id) => {
  if (String(id).startsWith('cricsheet-')) {
    return cricsheetApi.getMatchInfo(id);
  }

  const realArchiveMatch = await resolveGeneratedArchiveMatch(id);
  if (realArchiveMatch) {
    return realArchiveMatch;
  }

  const u19Match = u19WorldCupMatches.find((match) => match.id === id);
  if (u19Match) {
    return {
      status: 'success',
      data: {
        ...u19Match,
        scorecard: [],
        commentary: [],
      },
      info: {
        source: 'local-fixtures',
        reason: 'Scorecard will be available after the U19 World Cup match starts.',
      },
    };
  }

  const womenTournamentMatch = womenTournamentMatches.find((match) => match.id === id);
  if (womenTournamentMatch) {
    const focusName = womenTournamentMatch.id.includes('u19-womens')
      ? 'Gongadi Trisha'
      : womenTournamentMatch.id.includes('mi-dc')
        ? 'Nat Sciver-Brunt'
        : 'Harmanpreet Kaur';
    return {
      status: 'success',
      data: {
        ...womenTournamentMatch,
        scorecard: [
          {
            inning: womenTournamentMatch.teams?.[0] || womenTournamentMatch.series,
            batting: [
              { name: focusName, dismissal: 'scorecard summary', r: womenTournamentMatch.id.includes('u19-womens') ? 44 : 57, b: womenTournamentMatch.id.includes('u19-womens') ? 33 : 38, '4s': 6, '6s': 2, sr: womenTournamentMatch.id.includes('u19-womens') ? '133.33' : '150.00' },
            ],
            bowling: [],
            totals: { runs: womenTournamentMatch.id.includes('u19-womens') ? 44 : 57, wickets: 1, overs: '6.2', extras: 0 },
          },
        ],
        commentary: [
          { over: '1.1', event: '4', text: `${focusName} starts positively in ${womenTournamentMatch.series}.` },
          { over: '6.2', event: '50', text: `${womenTournamentMatch.status}.` },
        ],
      },
      info: {
        source: 'local-women-tournament',
        reason: 'Loaded local women tournament scorecard summary.',
      },
    };
  }

  const wplFullMatch = wplFullSeasonArchive.find((match) => match.id === id);
  if (wplFullMatch) {
    const archiveScore = buildArchiveScoreData(wplFullMatch);
    return {
      status: 'success',
      data: {
        ...wplFullMatch,
        ...archiveScore,
      },
      info: {
        source: 'local-wpl-archive',
        reason: 'Loaded completed WPL archive scorecard.',
      },
    };
  }

  const iplArchiveMatch = iplArchiveMatches.find((match) => match.id === id);
  if (iplArchiveMatch) {
    const archiveScore = buildArchiveScoreData(iplArchiveMatch);
    return {
      status: 'success',
      data: {
        ...iplArchiveMatch,
        ...archiveScore,
      },
      info: {
        source: 'local-ipl-archive',
        reason: 'Loaded completed IPL archive scorecard.',
      },
    };
  }

  const tournamentArchiveMatch = tournamentArchiveMatches.find((match) => match.id === id);
  if (tournamentArchiveMatch) {
    return {
      status: 'success',
      data: {
        ...tournamentArchiveMatch,
        scorecard: [],
        commentary: [
          { over: '-', event: 'Archive', text: `${tournamentArchiveMatch.name}: ${tournamentArchiveMatch.status}.` },
        ],
      },
      info: {
        source: 'local-tournament-archive',
        reason: 'Loaded local tournament archive scorecard summary.',
      },
    };
  }

  const worldCupFullMatch = worldCupFullMatchArchive.find((match) => match.id === id);
  if (worldCupFullMatch) {
    if (!isCompletedArchiveMatch(worldCupFullMatch)) {
      return {
        status: 'success',
        data: {
          ...worldCupFullMatch,
          scorecard: [],
          commentary: [{ over: '-', event: 'Preview', text: `${worldCupFullMatch.name} has not started.` }],
        },
        info: {
          source: 'local-world-cup-archive',
          reason: 'Loaded upcoming World Cup fixture preview.',
        },
      };
    }
    const archiveScore = buildArchiveScoreData(worldCupFullMatch);
    return {
      status: 'success',
      data: {
        ...worldCupFullMatch,
        ...archiveScore,
      },
      info: {
        source: 'local-world-cup-archive',
        reason: 'Loaded completed ICC Cricket World Cup archive scorecard.',
      },
    };
  }

  const numberedScorecardMatch = [...u19FullMatchArchive, ...womenU19FullMatchArchive].find((match) => match.id === id);
  if (numberedScorecardMatch) {
    if (!isCompletedArchiveMatch(numberedScorecardMatch)) {
      return {
        status: 'success',
        data: {
          ...numberedScorecardMatch,
          scorecard: [],
          commentary: [{ over: '-', event: 'Preview', text: `${numberedScorecardMatch.name} has not started.` }],
        },
        info: {
          source: 'local-numbered-tournament-archive',
          reason: 'Loaded upcoming tournament fixture preview.',
        },
      };
    }
    const archiveScore = buildArchiveScoreData(numberedScorecardMatch);
    return {
      status: 'success',
      data: {
        ...numberedScorecardMatch,
        ...archiveScore,
      },
      info: {
        source: 'local-numbered-tournament-archive',
        reason: 'Loaded completed tournament archive scorecard.',
      },
    };
  }

  const ashesFullMatch = ashesFullMatchArchive.find((match) => match.id === id);
  if (ashesFullMatch) {
    const archiveScore = buildArchiveScoreData(ashesFullMatch);
    return {
      status: 'success',
      data: {
        ...ashesFullMatch,
        ...archiveScore,
      },
      info: {
        source: 'local-ashes-archive',
        reason: 'Loaded completed Ashes archive scorecard.',
      },
    };
  }

  const spotlightMatch = playerSpotlightMatches.find((match) => match.id === id);
  if (spotlightMatch) {
    const isRohitT20 = spotlightMatch.id === 'spotlight-rohit-2026-mi-csk';
    const isViratT20 = spotlightMatch.id === 'spotlight-virat-rcb-gt';
    return {
      status: 'success',
      data: {
        ...spotlightMatch,
        scorecard: isRohitT20 ? [
          {
            inning: 'Mumbai Indians',
            batting: [
              { name: 'Rohit Sharma', dismissal: 'not out', r: 68, b: 43, '4s': 7, '6s': 4, sr: '158.14' },
            ],
            bowling: [],
            totals: { runs: 68, wickets: 0, overs: '7.1', extras: 0 },
          },
        ] : isViratT20 ? [
          {
            inning: 'Royal Challengers Bengaluru',
            batting: [
              { name: 'Virat Kohli', dismissal: 'c deep midwicket', r: 82, b: 51, '4s': 8, '6s': 3, sr: '160.78' },
            ],
            bowling: [],
            totals: { runs: 82, wickets: 1, overs: '8.3', extras: 0 },
          },
        ] : [],
        commentary: isRohitT20 ? [
          { over: '1.1', event: '4', text: 'Rohit Sharma opens the T20 innings with positive intent.' },
          { over: '5.4', event: '6', text: 'Rohit clears midwicket as Mumbai Indians build momentum.' },
          { over: '7.1', event: '50', text: 'Rohit reaches a fluent T20 half-century in the spotlight card.' },
        ] : isViratT20 ? [
          { over: '2.3', event: '4', text: 'Virat Kohli drives through cover to settle the RCB innings.' },
          { over: '9.2', event: '50', text: 'Kohli reaches a controlled T20 half-century from 34 balls.' },
          { over: '15.5', event: '6', text: 'Kohli launches over long-on as RCB push the tempo.' },
        ] : [],
      },
      info: {
        source: 'local-player-spotlight',
        reason: isRohitT20 || isViratT20
          ? `Loaded T20 spotlight scorecard and commentary for ${spotlightMatch.playerNames?.[0]}.`
          : 'Scorecard is unavailable for this local player spotlight card.',
      },
    };
  }

  const match = findMatch(id) || demoMatches[0];
  return withFallback('match_scorecard', { id }, {
    ...match,
    scorecard: match.score || [],
  });
};

const getSeries = async (offset = 0) => {
  const series = await withFallback('series', { offset }, demoSeries);
  if (!Array.isArray(series.data) || series.data.length === 0) {
    return cricsheetApi.getSeries();
  }

  return series;
};

const searchSeries = async (query) => {
  const normalized = String(query || '').toLowerCase();
  const u19Series = u19WorldCupSeries.filter((item) => archiveIncludesQuery(item, query));
  const iplSeries = iplArchiveSeriesForQuery(query);
  const tournamentSeries = tournamentArchiveSeriesForQuery(query);
  const womenSeries = womenTournamentSeriesForQuery(query);
  const exactPlayer = demoPlayers.some((player) => archiveIncludesQuery(player, query));

  if (iplSeries.length) {
    return {
      status: 'success',
      data: iplSeries,
      info: {
        source: 'local-ipl-archive',
        reason: 'Loaded IPL archive series details from local tournament data.',
      },
    };
  }

  if (womenSeries.length) {
    return {
      status: 'success',
      data: womenSeries,
      info: {
        source: 'local-women-tournament',
        reason: 'Loaded women tournament series details from local tournament data.',
      },
    };
  }

  if (tournamentSeries.length) {
    return {
      status: 'success',
      data: tournamentSeries,
      info: {
        source: 'local-tournament-archive',
        reason: 'Loaded tournament archive series details from local data.',
      },
    };
  }

  if (u19Series.length) {
    return {
      status: 'success',
      data: u19Series,
      info: {
        source: 'local-fixtures',
        reason: 'Loaded U19 World Cup tournament details from local fixture data.',
      },
    };
  }

  if (exactPlayer) {
    return {
      status: 'success',
      data: [],
      info: {
        source: 'local-players',
        reason: 'Series results are hidden for exact player-name searches.',
      },
    };
  }

  const fallback = [...demoSeries, ...iplArchiveSeries, ...tournamentArchiveSeries, ...u19WorldCupSeries, ...womenTournamentSeries].filter((series) =>
    series.name.toLowerCase().includes(normalized) || archiveIncludesQuery(series, query)
  );
  const series = await withFallback('series', { search: query }, fallback);

  if (!Array.isArray(series.data) || series.data.length === 0) {
    const cricsheetSeries = await cricsheetApi.getSeries(query);
    return {
      ...cricsheetSeries,
      data: mergeById([
        ...(Array.isArray(cricsheetSeries.data) ? cricsheetSeries.data : []),
        ...u19Series,
      ]),
    };
  }

  return {
    ...series,
    data: mergeById([
      ...(Array.isArray(series.data) ? series.data : []),
      ...u19Series,
    ]),
  };
};

const searchPlayers = async (query) => {
  const terms = termsFor(query);
  const fallback = demoPlayers.filter((player) =>
    terms.every((term) => searchable(`${player.name} ${player.country} ${player.role || ''}`).includes(term))
  );

  if (fallback.length) {
    return {
      status: 'success',
      data: fallback,
      info: {
        source: 'local-players',
        reason: 'Loaded matching player profile from local player data.',
      },
    };
  }

  const players = await withFallback('players', { search: query }, fallback);
  if (!Array.isArray(players.data) || players.data.length === 0) {
    return cricsheetApi.searchPlayers(query);
  }

  return players;
};

const searchMatches = async (query, options = {}) => {
  const iplMatches = iplArchiveMatchesForQuery(query, options);
  if (iplMatches.length || iplArchiveSeriesForQuery(query).length) {
    const realMatches = await searchRealTournamentMatches('IPL', options);
    if (realMatches) {
      return realMatches;
    }

    return {
      status: 'success',
      data: iplMatches,
      info: {
        source: 'local-ipl-archive',
        reason: iplMatches.length
          ? 'Loaded IPL archive match list from local tournament data.'
          : 'No matches found for the selected year.',
      },
    };
  }

  const womenMatches = womenTournamentMatchesForQuery(query, options);
  const wplFullMatches = wplFullMatchesForQuery(query, options);
  const womenU19FullMatches = womenU19FullMatchesForQuery(query, options);
  const mergedWomenMatches = wplFullMatches.length
    ? wplFullMatches
    : womenU19FullMatches.length
      ? womenU19FullMatches
      : womenMatches;
  if (mergedWomenMatches.length || womenTournamentSeriesForQuery(query).length) {
    const realMatches = await searchRealTournamentMatches(
      womenU19FullMatches.length ? "ICC Women's U19 T20 World Cup" : 'WPL',
      options
    );
    if (realMatches) {
      return realMatches;
    }

    return {
      status: 'success',
      data: mergedWomenMatches,
      info: {
        source: wplFullMatches.length
          ? 'local-wpl-archive'
          : womenU19FullMatches.length
            ? 'local-numbered-tournament-archive'
            : 'local-women-tournament',
        reason: mergedWomenMatches.length
          ? 'Loaded women tournament match list from local tournament data.'
          : 'No matches found for the selected tournament and year.',
      },
    };
  }

  const worldCupMatches = worldCupFullMatchesForQuery(query, options);
  const ashesMatches = ashesFullMatchesForQuery(query, options);
  const u19FullMatches = u19FullMatchesForQuery(query, options);
  const tournamentMatches = tournamentArchiveMatchesForQuery(query, options);
  const mergedTournamentMatches = worldCupMatches.length
    ? worldCupMatches
    : ashesMatches.length
      ? ashesMatches
      : u19FullMatches.length
        ? u19FullMatches
        : tournamentMatches;
  if (mergedTournamentMatches.length || tournamentArchiveSeriesForQuery(query).length) {
    const realMatches = await searchRealTournamentMatches(
      worldCupMatches.length
        ? 'ICC Cricket World Cup'
        : ashesMatches.length
          ? 'The Ashes'
          : u19FullMatches.length
            ? 'ICC U19 Cricket World Cup'
            : query,
      options
    );
    if (realMatches) {
      return realMatches;
    }

    return {
      status: 'success',
      data: mergedTournamentMatches,
      info: {
        source: worldCupMatches.length
          ? 'local-world-cup-archive'
          : ashesMatches.length
            ? 'local-ashes-archive'
            : u19FullMatches.length
              ? 'local-numbered-tournament-archive'
              : 'local-tournament-archive',
        reason: mergedTournamentMatches.length
          ? 'Loaded tournament archive match list from local data.'
          : 'No matches found for the selected tournament and year.',
      },
    };
  }

  const playerMatches = localPlayerMatchesForQuery(query, options);
  if (playerMatches.length) {
    return {
      status: 'success',
      data: playerMatches,
      info: {
        source: 'local-player-spotlight',
        reason: 'Loaded player-focused match cards from local spotlight data.',
      },
    };
  }

  const u19Matches = u19WorldCupMatches.filter((match) =>
    archiveIncludesQuery(match, query) && matchesYear(match, options.year)
  );

  if (u19Matches.length && archiveIncludesQuery({ name: 'U19 World Cup' }, query)) {
    return {
      status: 'success',
      data: u19Matches,
      info: {
        source: 'local-fixtures',
        reason: 'Loaded U19 World Cup match details from local fixture data.',
      },
    };
  }

  const providerMatches = await getMatches();
  const matches = Array.isArray(providerMatches.data) ? providerMatches.data : [];

  if (providerMatches.info?.source === 'cricsheet') {
    const cricsheetMatches = await cricsheetApi.searchMatches(query, options);
    return {
      ...cricsheetMatches,
      data: mergeById([...(Array.isArray(cricsheetMatches.data) ? cricsheetMatches.data : []), ...u19Matches]),
    };
  }

  return {
    status: 'success',
    data: mergeById([...matches, ...u19Matches]),
    info: providerMatches.info || {},
  };
};

const getPlayerInfo = async (id) => {
  if (String(id).startsWith('cricsheet-player-')) {
    return cricsheetApi.getPlayerInfo(id);
  }

  if (localPlayerProfiles[id]) {
    return {
      status: 'success',
      data: localPlayerProfiles[id],
      info: {
        source: 'local-player-profile',
        reason: 'Loaded curated local player profile with T20 details and news actions.',
      },
    };
  }

  const fallback = findPlayer(id) || {
    id,
    name: 'Player profile unavailable',
    country: 'Unknown',
  };
  return withFallback('players_info', { id }, fallback);
};

const normalizeSeason = (season) => ({
  year: String(season.year),
  totalMatches: season.totalMatches ?? season.t20 ?? season.odi ?? season.matches,
  winner: season.winner || 'Winner unavailable',
});

const buildTournamentMetadata = (key, label, query, seasons) => {
  const normalizedSeasons = seasons
    .map(normalizeSeason)
    .filter((season) => season.year && !Number.isNaN(Number(season.year)))
    .sort((a, b) => Number(a.year) - Number(b.year));
  const years = normalizedSeasons.map((season) => season.year);

  return {
    key,
    label,
    query,
    earliestYear: years[0] || null,
    latestYear: years[years.length - 1] || null,
    years,
    seasons: normalizedSeasons,
  };
};

const getTournamentMetadata = async () => {
  const ashesSeasons = tournamentArchiveSeasons.find((item) => item.key === 'the-ashes')?.years || [];
  const u19Seasons = tournamentArchiveSeasons.find((item) => item.key === 'u19-world-cup')?.years || [];
  const wplSeasons = womenTournamentSeries
    .filter((series) => series.tournamentKey === 'wpl')
    .map((series) => ({
      year: String(series.name).match(/\b(19|20)\d{2}\b/)?.[0],
      totalMatches: series.t20,
      winner: series.winner,
    }));
  const womenU19Seasons = womenTournamentSeries
    .filter((series) => series.tournamentKey === 'u19-womens-world-cup')
    .map((series) => ({
      year: String(series.name).match(/\b(19|20)\d{2}\b/)?.[0],
      totalMatches: series.t20,
      winner: series.winner,
    }));

  return {
    status: 'success',
    data: [
      buildTournamentMetadata('ipl', 'IPL', 'IPL', iplSeasonSummaries),
      buildTournamentMetadata('icc-world-cup', 'ICC Cricket World Cup', 'ICC Cricket World Cup', worldCupSeasonArchive),
      buildTournamentMetadata('the-ashes', 'The Ashes', 'The Ashes', ashesSeasons),
      buildTournamentMetadata('wpl', 'WPL', 'WPL', wplSeasons),
      buildTournamentMetadata('u19-womens-world-cup', 'ICC Women\'s U19 T20 World Cup', 'ICC Women U19 T20 World Cup', womenU19Seasons),
      buildTournamentMetadata('u19-world-cup', 'ICC U19 Cricket World Cup', 'ICC U19 Cricket World Cup', u19Seasons),
    ],
  };
};

module.exports = {
  getMatches,
  getMatchInfo,
  getScorecard,
  getSeries,
  searchSeries,
  searchPlayers,
  searchMatches,
  getPlayerInfo,
  getTournamentMetadata,
};
