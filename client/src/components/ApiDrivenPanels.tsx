'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, ChevronRight, Database, ShieldCheck, Trophy } from 'lucide-react';
import { getMatches, getSeries } from '@/lib/api';
import { asArray, CricketMatch, formatMatchDateTime, scoreForTeam, sortByDateAsc, teamName } from '@/lib/cricket';

type SeriesItem = {
  id?: string;
  name?: string;
  startDate?: string;
  endDate?: string;
  odi?: number;
  t20?: number;
  test?: number;
  matches?: number;
};

const categories = [
  { label: 'IPL', keywords: ['ipl', 'indian premier league'] },
  { label: 'ICC Events', keywords: ['icc', 'world cup', 'champions trophy', 't20 world cup'] },
  { label: "Women's Cricket", keywords: ['women', 'wpl'] },
  { label: 'U19 Cricket', keywords: ['u19', 'under-19', 'under 19'] },
];

export const TrendingFromLive = () => {
  const [matches, setMatches] = useState<CricketMatch[]>([]);

  useEffect(() => {
    getMatches()
      .then((data) => {
        const orderedMatches = asArray<CricketMatch>(data)
          .filter((match) => match.name || match.teams?.length || match.status)
          .sort((a, b) => {
            const statusWeight = (match: CricketMatch) => match.matchStarted && !match.matchEnded ? 0 : match.matchEnded ? 1 : 2;
            const statusDelta = statusWeight(a) - statusWeight(b);
            if (statusDelta) return statusDelta;
            return new Date(b.dateTimeGMT || b.date || 0).getTime() - new Date(a.dateTimeGMT || a.date || 0).getTime();
          })
          .slice(0, 12);

        setMatches(orderedMatches);
      })
      .catch(() => setMatches([]));
  }, []);

  const headlines = matches
    .filter((match) => match.status || match.name)
    .map((match) => {
      const title = match.name || `${teamName(match, 0)} vs ${teamName(match, 1)}`;
      const status = match.matchStarted && !match.matchEnded
        ? 'LIVE'
        : match.matchEnded
          ? 'RESULT'
          : 'UPCOMING';
      const score = match.score?.length
        ? `${teamName(match, 0)} ${scoreForTeam(match, 0)} - ${teamName(match, 1)} ${scoreForTeam(match, 1)}`
        : match.status || 'Schedule pending';

      return `${status}: ${title}: ${score}${match.status ? ` | ${match.status}` : ''}`;
    });

  if (headlines.length === 0) return null;
  const tickerItems = [...headlines, ...headlines];

  return (
    <div className="bg-[#1a365d] text-white py-3 border-t border-blue-800 overflow-hidden">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex shrink-0 items-center gap-2 text-xs">
          <Trophy size={14} className="text-orange-500" />
          <span className="font-bold text-orange-500 uppercase tracking-wider whitespace-nowrap">Live Feed:</span>
        </div>
        <div className="cz-score-ticker flex-1 overflow-hidden text-xs text-blue-100">
          <div className="cz-score-ticker-track">
            {tickerItems.map((headline, index) => (
              <span key={`${headline}-${index}`} className="cz-score-ticker-item">
                {headline}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const TournamentSections = () => {
  const [series, setSeries] = useState<SeriesItem[]>([]);
  const [matches, setMatches] = useState<CricketMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getSeries().catch(() => []),
      getMatches().catch(() => []),
    ]).then(([seriesData, matchData]) => {
      setSeries(asArray<SeriesItem>(seriesData));
      setMatches(sortByDateAsc(asArray<CricketMatch>(matchData)));
      setLoading(false);
    });
  }, []);

  const grouped = useMemo(() => categories.map((category) => {
    const seriesMatches = series.filter((item) =>
      category.keywords.some((keyword) => item.name?.toLowerCase().includes(keyword))
    ).slice(0, 4);
    const fixtureMatches = matches.filter((match) =>
      category.keywords.some((keyword) => `${match.series || ''} ${match.name || ''}`.toLowerCase().includes(keyword))
    ).slice(0, 3);
    return { ...category, series: seriesMatches, fixtures: fixtureMatches };
  }), [series, matches]);

  return (
    <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-extrabold flex items-center gap-2 text-gray-900 dark:text-white">
            <Database size={24} className="text-blue-600" /> Tournament Sections
          </h2>
          <p className="text-sm text-gray-500 mt-1">IPL, ICC, women's, and U19 coverage filtered from provider series and fixtures</p>
        </div>
        <Link href="/search?q=cricket%20series" className="text-blue-600 text-sm font-bold hover:underline flex items-center bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full">
          Search Archive <ChevronRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {grouped.map((group) => (
          <div key={group.label} className="border border-gray-100 dark:border-gray-800 rounded-xl p-5">
            <h3 className="font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <ShieldCheck size={16} className="text-orange-500" /> {group.label}
            </h3>
            {loading ? (
              <div className="h-20 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
            ) : group.series.length || group.fixtures.length ? (
              <div className="space-y-3">
                {group.series.map((item) => (
                  <div key={item.id || item.name} className="text-sm">
                    <p className="font-bold text-gray-800 dark:text-gray-100">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      {[item.startDate, item.endDate].filter(Boolean).join(' to ') || 'Dates from provider unavailable'}
                    </p>
                  </div>
                ))}
                {group.fixtures.map((match) => {
                  const when = formatMatchDateTime(match.dateTimeGMT || match.date);
                  return (
                    <Link key={match.id} href={`/match?id=${encodeURIComponent(match.id)}`} className="block rounded-lg bg-gray-50 dark:bg-gray-800/60 p-3 text-sm hover:bg-orange-50 dark:hover:bg-orange-900/20">
                      <p className="font-bold text-gray-800 dark:text-gray-100">{match.name || `${teamName(match, 0)} vs ${teamName(match, 1)}`}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <CalendarDays size={12} /> {when.date} | {when.time}
                      </p>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No current provider records found for this category.</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
