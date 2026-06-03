export type CricketMatch = {
  id: string;
  name?: string;
  series?: string;
  matchType?: string;
  status?: string;
  venue?: string;
  date?: string;
  dateTimeGMT?: string;
  matchStarted?: boolean;
  matchEnded?: boolean;
  teams?: string[];
  teamInfo?: Array<{ name?: string; shortname?: string; img?: string }>;
  score?: Array<{ inning?: string; r?: number; w?: number; o?: number }>;
  tossWinner?: string;
  tossChoice?: string;
  matchWinner?: string;
};

export const asArray = <T>(value: T[] | undefined | null): T[] => Array.isArray(value) ? value : [];

export const teamName = (match: CricketMatch, index: number) =>
  match.teamInfo?.[index]?.name || match.teams?.[index] || `Team ${index + 1}`;

export const teamShort = (match: CricketMatch, index: number) =>
  match.teamInfo?.[index]?.shortname || teamName(match, index).slice(0, 3).toUpperCase();

export const scoreForTeam = (match: CricketMatch, index: number) => {
  const score = match.score?.[index];
  if (!score) return 'Yet to bat';
  const wickets = score.w === 10 ? '10' : String(score.w ?? 0);
  return `${score.r ?? 0}/${wickets}`;
};

export const oversForTeam = (match: CricketMatch, index: number) => {
  const score = match.score?.[index];
  return score?.o !== undefined ? `${score.o} ov` : '';
};

export const formatMatchDateTime = (value?: string) => {
  if (!value) return { date: 'Date TBA', day: 'TBA', time: 'Time TBA' };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: value, day: 'TBA', time: 'Time TBA' };
  return {
    date: date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }),
    day: date.toLocaleDateString(undefined, { weekday: 'long' }),
    time: date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
  };
};

export const sortByDateAsc = (matches: CricketMatch[]) =>
  [...matches].sort((a, b) => new Date(a.dateTimeGMT || a.date || 0).getTime() - new Date(b.dateTimeGMT || b.date || 0).getTime());

export const sortByDateDesc = (matches: CricketMatch[]) =>
  [...matches].sort((a, b) => new Date(b.dateTimeGMT || b.date || 0).getTime() - new Date(a.dateTimeGMT || a.date || 0).getTime());
