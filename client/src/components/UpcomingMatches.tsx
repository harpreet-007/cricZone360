'use client';

import React, { useEffect, useState } from 'react';
import { getMatches } from '@/lib/api';
import { logClientWarning } from '@/lib/clientError';
import { asArray, CricketMatch, formatMatchDateTime, isUpcomingMatch, sortByDateAsc, teamName, teamShort } from '@/lib/cricket';
import { Calendar, MapPin, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const TeamLogo = ({ match, index, tone }: { match: CricketMatch; index: number; tone: 'blue' | 'yellow' }) => {
  const image = match.teamInfo?.[index]?.img;
  const toneClass = tone === 'blue'
    ? 'bg-blue-50 text-blue-700 ring-blue-100 dark:bg-blue-950/40 dark:ring-blue-900/60'
    : 'bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-950/40 dark:ring-amber-900/60';

  return (
    <div className={`flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl font-black shadow-sm ring-1 ${toneClass}`}>
      {image ? <img src={image} alt={`${teamName(match, index)} logo`} className="h-full w-full object-cover" /> : teamShort(match, index)}
    </div>
  );
};

const UpcomingMatches = () => {
  const [matches, setMatches] = useState<CricketMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const data = await getMatches({ feed: 'upcoming' });
        const upcoming = sortByDateAsc(asArray<CricketMatch>(data).filter(isUpcomingMatch));
        setMatches(upcoming);
        setLoading(false);
      } catch (error) {
        logClientWarning('Error fetching upcoming matches', error);
        setMatches([]);
        setLoading(false);
      }
    };

    fetchMatches();
    const interval = window.setInterval(fetchMatches, 60000);
    return () => window.clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="cz-shimmer rounded-xl h-40 border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900"></div>
        ))}
      </div>
    );
  }

  return (
    <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-extrabold flex items-center gap-2 text-gray-900 dark:text-white">
            <Calendar size={24} className="text-blue-600" /> Upcoming Matches
          </h2>
          <p className="text-sm text-gray-500 mt-1">Scheduled fixtures from the cricket API</p>
        </div>
      </div>
      
      {matches.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 p-10 text-center text-sm font-bold text-gray-500 dark:border-gray-800">
          No upcoming matches available.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matches.map((match) => (
          <div key={match.id} className="cz-card-motion group flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:border-blue-200 hover:shadow-xl dark:border-gray-800 dark:bg-gray-950/60 dark:hover:border-blue-900">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold px-2 py-1 rounded uppercase truncate max-w-[150px]">
                {match.series || 'International'}
              </span>
              <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-tighter text-orange-600 ring-1 ring-orange-100 dark:bg-orange-950/40 dark:ring-orange-900/50">
                UPCOMING
              </span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-col items-center gap-2 flex-1">
                <TeamLogo match={match} index={0} tone="blue" />
                <span className="text-sm font-bold text-center line-clamp-1">{teamName(match, 0)}</span>
              </div>
              <div className="px-4 font-black text-gray-200 dark:text-gray-700">VS</div>
              <div className="flex flex-col items-center gap-2 flex-1">
                <TeamLogo match={match} index={1} tone="yellow" />
                <span className="text-sm font-bold text-center line-clamp-1">{teamName(match, 1)}</span>
              </div>
            </div>
            <div className="mt-2 pt-4 border-t border-gray-50 dark:border-gray-800 text-center">
              <p className="text-[10px] text-gray-400 mb-1 uppercase font-bold">
                {formatMatchDateTime(match.dateTimeGMT || match.date).day} | {formatMatchDateTime(match.dateTimeGMT || match.date).date} | {formatMatchDateTime(match.dateTimeGMT || match.date).time}
              </p>
              <p className="text-xs text-gray-500 flex items-center justify-center gap-1 line-clamp-1">
                <MapPin size={12} /> {match.venue}
              </p>
              <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">
                {match.series || 'Series/Tournament unavailable'}
              </p>
            </div>
          </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default UpcomingMatches;
