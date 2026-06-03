const API_BASE_URL = 'https://api.cricapi.com/v1';

const json = (data, init = {}) => new Response(JSON.stringify(data), {
  ...init,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    ...(init.headers || {}),
  },
});

const termsFor = (value) => String(value || '')
  .toLowerCase()
  .replace(/\bvs\b|\bv\b|versus/g, ' ')
  .split(/\s+/)
  .filter(Boolean);

const textFor = (item) => [
  item?.name,
  item?.series,
  item?.venue,
  item?.status,
  item?.country,
  item?.role,
  ...(Array.isArray(item?.teams) ? item.teams : []),
  ...(Array.isArray(item?.playerNames) ? item.playerNames : []),
  ...(Array.isArray(item?.teamInfo) ? item.teamInfo.map((team) => `${team.name || ''} ${team.shortname || ''}`) : []),
].join(' ').toLowerCase();

const includesQuery = (item, query) => {
  const terms = termsFor(query);
  if (!terms.length) return true;
  const haystack = textFor(item);
  return terms.every((term) => haystack.includes(term));
};

const mergeById = (lists) => {
  const map = new Map();
  lists.flat().forEach((item) => {
    const key = item?.id || item?.name;
    if (key && !map.has(key)) map.set(key, item);
  });
  return Array.from(map.values());
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

  const response = await fetch(url.toString(), {
    headers: { accept: 'application/json' },
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      status: 'failure',
      data: [],
      info: {
        source: 'cricapi',
        reason: payload?.message || `Provider request failed: ${response.status}`,
      },
    };
  }

  return {
    status: payload.status || 'success',
    data: Array.isArray(payload.data) ? payload.data : payload.data || [],
    info: {
      ...(payload.info || {}),
      source: 'cricapi',
      endpoint,
    },
  };
};

const getAllMatches = async (env) => {
  const [current, scheduled] = await Promise.all([
    providerRequest(env, 'currentMatches', { offset: 0 }),
    providerRequest(env, 'matches', { offset: 0 }),
  ]);

  return {
    status: 'success',
    data: mergeById([
      Array.isArray(current.data) ? current.data : [],
      Array.isArray(scheduled.data) ? scheduled.data : [],
    ]),
    info: {
      source: 'cricapi',
      current: current.info,
      scheduled: scheduled.info,
    },
  };
};

const searchPlayers = async (env, query) => {
  const players = await providerRequest(env, 'players', { search: query });
  return {
    ...players,
    data: (Array.isArray(players.data) ? players.data : [])
      .filter((player) => includesQuery(player, query))
      .slice(0, 20),
  };
};

const searchSeries = async (env, query) => {
  const series = await providerRequest(env, 'series', { search: query, offset: 0 });
  return {
    ...series,
    data: (Array.isArray(series.data) ? series.data : [])
      .filter((item) => includesQuery(item, query))
      .slice(0, 20),
  };
};

const searchMatches = async (env, query, year) => {
  const matches = await getAllMatches(env);
  return {
    ...matches,
    data: (Array.isArray(matches.data) ? matches.data : [])
      .filter((match) => includesQuery(match, query))
      .filter((match) => !year || String(match.date || match.dateTimeGMT || match.name || '').includes(String(year)))
      .slice(0, 80),
  };
};

const searchMetadata = async (env) => {
  const series = await providerRequest(env, 'series', { offset: 0 });
  const items = Array.isArray(series.data) ? series.data : [];
  const tournamentDefs = [
    { key: 'ipl', label: 'IPL', query: 'IPL', keywords: ['ipl', 'indian premier league'] },
    { key: 'wpl', label: 'WPL', query: 'WPL', keywords: ['wpl', "women's premier league"] },
    { key: 'icc-world-cup', label: 'ICC Cricket World Cup', query: 'ICC Cricket World Cup', keywords: ['world cup', 'icc'] },
    { key: 'the-ashes', label: 'The Ashes', query: 'The Ashes', keywords: ['ashes'] },
    { key: 'u19-world-cup', label: 'ICC U19 Cricket World Cup', query: 'ICC U19 Cricket World Cup', keywords: ['u19', 'under 19', 'under-19'] },
    { key: 'u19-womens-world-cup', label: "ICC Women's U19 T20 World Cup", query: "ICC Women's U19 T20 World Cup", keywords: ['women', 'u19'] },
  ];

  return tournamentDefs.map((def) => {
    const years = Array.from(new Set(items
      .filter((item) => def.keywords.some((keyword) => String(item.name || '').toLowerCase().includes(keyword)))
      .flatMap((item) => String(`${item.name || ''} ${item.startDate || ''} ${item.endDate || ''}`).match(/\b(19|20)\d{2}\b/g) || [])))
      .sort((a, b) => Number(a) - Number(b));

    return {
      key: def.key,
      label: def.label,
      query: def.query,
      earliestYear: years[0] || null,
      latestYear: years[years.length - 1] || null,
      years,
      seasons: years.map((year) => ({ year, totalMatches: '', winner: 'Winner unavailable from live API' })),
    };
  });
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
      });
    }

    if (path[0] === 'matches' && path[1] === 'series') {
      const data = await providerRequest(env, 'series', { offset: url.searchParams.get('offset') || 0 });
      return json({ status: 'success', data: data.data, info: data.info });
    }

    if (path[0] === 'matches' && path[1] && path[2] === 'scorecard') {
      const data = await providerRequest(env, 'match_scorecard', { id: decodeURIComponent(path[1]) });
      return json({ status: 'success', data: data.data, info: data.info });
    }

    if (path[0] === 'matches' && path[1]) {
      const data = await providerRequest(env, 'match_info', { id: decodeURIComponent(path[1]) });
      return json({ status: 'success', data: data.data, info: data.info });
    }

    if (path[0] === 'matches') {
      const data = await getAllMatches(env);
      return json({ status: 'success', data: data.data, info: data.info });
    }

    if (path[0] === 'players' && path[1] === 'search') {
      const data = await searchPlayers(env, url.searchParams.get('name') || '');
      return json({ status: 'success', data: data.data, info: data.info });
    }

    if (path[0] === 'players' && path[1]) {
      const data = await providerRequest(env, 'players_info', { id: decodeURIComponent(path[1]) });
      return json({ status: 'success', data: data.data, info: data.info });
    }

    if (path[0] === 'search' && path[1] === 'metadata') {
      return json({ status: 'success', data: await searchMetadata(env) });
    }

    if (path[0] === 'search') {
      const query = url.searchParams.get('q') || '';
      const year = url.searchParams.get('year') || '';
      const [players, matches, series] = await Promise.all([
        searchPlayers(env, query).catch(() => ({ data: [], info: {} })),
        searchMatches(env, query, year).catch(() => ({ data: [], info: {} })),
        searchSeries(env, query).catch(() => ({ data: [], info: {} })),
      ]);

      return json({
        status: 'success',
        data: {
          players: players.data || [],
          matches: matches.data || [],
          series: series.data || [],
          info: {
            players: players.info || {},
            matches: matches.info || {},
            series: series.info || {},
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
