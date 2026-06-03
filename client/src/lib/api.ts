declare global {
  interface Window {
    __CRICZONE_CONFIG__?: {
      API_URL?: string;
      SOCKET_URL?: string;
    };
  }
}

const trimSlash = (value: string) => value.replace(/\/+$/, '');

const isLocalHost = (hostname: string) =>
  hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';

const isLocalUrl = (value?: string) =>
  Boolean(value && /https?:\/\/(localhost|127\.0\.0\.1|\[?::1\]?)(:\d+)?/i.test(value));

const getApiBaseUrl = () => {
  const configured = process.env.NEXT_PUBLIC_API_URL;

  if (typeof window === 'undefined') {
    return trimSlash(configured || 'http://localhost:5001/api');
  }

  const runtimeUrl = window.__CRICZONE_CONFIG__?.API_URL;
  if (isLocalHost(window.location.hostname)) {
    if (runtimeUrl) return trimSlash(runtimeUrl);
    if (configured) return trimSlash(configured);
    return 'http://localhost:5001/api';
  }

  if (runtimeUrl && !isLocalUrl(runtimeUrl)) return trimSlash(runtimeUrl);
  if (configured && !isLocalUrl(configured)) return trimSlash(configured);

  return `${window.location.origin}/api`;
};

const extractData = (payload: any) => {
  if (payload && payload.status === 'success') {
    return payload.data;
  }
  if (payload && payload.data) {
    return payload.data;
  }
  return payload;
};

const request = async (path: string, params?: Record<string, string | number | undefined>) => {
  const url = new URL(`${getApiBaseUrl()}${path}`);

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url.toString(), {
    cache: 'no-store',
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.message || `API request failed: ${response.status}`);
  }

  return extractData(payload);
};

export const getMatches = async () => request('/matches');

export const getMatchInfo = async (id: string) => request(`/matches/${id}`);

export const getScorecard = async (id: string) => request(`/matches/${id}/scorecard`);

export const searchEverything = async (query: string, year?: string, tournament?: string) =>
  request('/search', { q: query, year, tournament });

export const getSearchMetadata = async () => request('/search/metadata');

export const searchPlayers = async (name: string) => request('/players/search', { name });

export const getPlayerInfo = async (id: string) => request(`/players/${id}`);

export const getSeries = async (offset = 0) => request('/matches/series', { offset });
