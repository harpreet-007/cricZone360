'use client';

import React, { useEffect, useState } from 'react';
import { getMatches } from '@/lib/api';
import { logClientWarning } from '@/lib/clientError';
import { asArray, CricketMatch, formatMatchDateTime, sortByDateAsc, teamName, teamShort } from '@/lib/cricket';
import { Calendar, MapPin, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const fallbackUpcoming: CricketMatch[] = [
  {
    id: 'fixture-wi-sl-2026-1st-odi',
    name: 'West Indies vs Sri Lanka, 1st ODI',
    series: 'Sri Lanka tour of West Indies 2026',
    venue: 'West Indies',
    date: '2026-06-03T11:00:00',
    dateTimeGMT: '2026-06-03T15:00:00Z',
    matchStarted: false,
    matchEnded: false,
    teams: ['West Indies', 'Sri Lanka'],
    teamInfo: [
      { name: 'West Indies', shortname: 'WI' },
      { name: 'Sri Lanka', shortname: 'SL' },
    ],
  },
  {
    id: 'fixture-asian-games-qualifier-semi-1-2026',
    name: 'Asian Games Men T20I Qualifier, 1st Semi-Final',
    series: 'Asian Games Men T20I Qualifier',
    venue: 'Singapore Cricket Club, Padang',
    date: '2026-06-07T02:30:00Z',
    dateTimeGMT: '2026-06-07T02:30:00Z',
    matchStarted: false,
    matchEnded: false,
    teams: ['TBA', 'TBA'],
    teamInfo: [
      { name: 'TBA', shortname: 'TBA' },
      { name: 'TBA', shortname: 'TBA' },
    ],
  },
  {
    id: 'fixture-sl-a-ind-a-2026',
    name: 'Sri Lanka A vs India A',
    series: 'ODI Tri-Series in Sri Lanka',
    venue: 'Rangiri Dambulla International Stadium, Dambulla',
    date: '2026-06-15T05:30:00Z',
    dateTimeGMT: '2026-06-15T05:30:00Z',
    matchStarted: false,
    matchEnded: false,
    teams: ['Sri Lanka A', 'India A'],
    teamInfo: [
      { name: 'Sri Lanka A', shortname: 'SL-A' },
      { name: 'India A', shortname: 'IND-A' },
    ],
  },
];

const UpcomingMatches = () => {
  const [matches, setMatches] = useState<CricketMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const data = await getMatches();
        const upcoming = sortByDateAsc(asArray<CricketMatch>(data).filter((m) => !m.matchStarted && !m.matchEnded)).slice(0, 6);
        setMatches(upcoming.length ? upcoming : fallbackUpcoming);
        setLoading(false);
      } catch (error) {
        logClientWarning('Error fetching upcoming matches', error);
        setMatches(fallbackUpcoming);
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse bg-white dark:bg-gray-900 rounded-xl h-40 border border-gray-100 dark:border-gray-800"></div>
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
          <p className="text-sm text-gray-500 mt-1">Don't miss out on the upcoming action</p>
        </div>
        <Link href="/search?q=schedule" className="text-blue-600 text-sm font-bold hover:underline flex items-center bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full">
          Full Schedule <ChevronRight size={16} />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matches.map((match) => (
          <div key={match.id} className="flex flex-col p-5 border border-gray-100 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:shadow-md group">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold px-2 py-1 rounded uppercase truncate max-w-[150px]">
                {match.series || 'International'}
              </span>
              <span className="text-[10px] text-orange-600 font-bold flex items-center gap-1 uppercase tracking-tighter">
                <Clock size={10} /> {formatMatchDateTime(match.dateTimeGMT || match.date).time}
              </span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center font-bold text-blue-600">
                  {teamShort(match, 0)}
                </div>
                <span className="text-sm font-bold text-center line-clamp-1">{teamName(match, 0)}</span>
              </div>
              <div className="px-4 font-black text-gray-200 dark:text-gray-700">VS</div>
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="w-12 h-12 bg-yellow-50 dark:bg-yellow-900/20 rounded-full flex items-center justify-center font-bold text-yellow-600">
                  {teamShort(match, 1)}
                </div>
                <span className="text-sm font-bold text-center line-clamp-1">{teamName(match, 1)}</span>
              </div>
            </div>
            <div className="mt-2 pt-4 border-t border-gray-50 dark:border-gray-800 text-center">
              <p className="text-xs text-gray-500 flex items-center justify-center gap-1 line-clamp-1">
                <MapPin size={12} /> {match.venue}
              </p>
              <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">
                {formatMatchDateTime(match.dateTimeGMT || match.date).day} | {formatMatchDateTime(match.dateTimeGMT || match.date).date}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default UpcomingMatches;
