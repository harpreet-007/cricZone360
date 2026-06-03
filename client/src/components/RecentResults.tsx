'use client';

import React, { useEffect, useState } from 'react';
import { getMatches } from '@/lib/api';
import { asArray, CricketMatch, formatMatchDateTime, scoreForTeam, sortByDateDesc, teamName, teamShort } from '@/lib/cricket';
import { Zap, ChevronRight, Trophy } from 'lucide-react';
import Link from 'next/link';

const RecentResults = () => {
  const [matches, setMatches] = useState<CricketMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const data = await getMatches();
        const ended = sortByDateDesc(asArray<CricketMatch>(data).filter((m) => m.matchEnded)).slice(0, 4);
        setMatches(ended);
      } catch (error) {
        console.error('Error fetching recent results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-white dark:bg-gray-900 rounded-2xl h-32 border border-gray-100 dark:border-gray-800"></div>
        ))}
      </div>
    );
  }

  if (matches.length === 0) return null;

  return (
    <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-extrabold flex items-center gap-2 text-gray-900 dark:text-white">
            <Zap size={24} className="text-orange-500" /> Recent Results
          </h2>
          <p className="text-sm text-gray-500 mt-1">Latest completed matches from the live provider</p>
        </div>
        <Link href="/search?q=results" className="text-orange-500 text-sm font-bold hover:underline flex items-center bg-orange-50 dark:bg-orange-900/20 px-4 py-2 rounded-full">
          All Results <ChevronRight size={16} />
        </Link>
      </div>

      <div className="space-y-4">
        {matches.map((match) => (
          <div key={match.id} className="p-6 border border-gray-100 dark:border-gray-800 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase mb-3">
                  <span className="truncate max-w-[200px]">{match.series || 'Series'}</span>
                  <span>|</span>
                  <span>Ended {formatMatchDateTime(match.dateTimeGMT || match.date).date}</span>
                </div>
                <div className="space-y-3">
                  {[0, 1].map((index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`${index === 0 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600'} w-8 h-8 rounded flex items-center justify-center font-bold text-xs`}>
                          {teamShort(match, index)}
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">{teamName(match, index)}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-lg">{scoreForTeam(match, index)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="md:w-64 flex flex-col items-center md:items-end justify-center border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-800 pt-4 md:pt-0 md:pl-6">
                <p className="text-blue-600 font-bold text-sm mb-2 text-center md:text-right">{match.status}</p>
                {match.matchWinner && (
                  <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                    <Trophy size={12} /> Winner: {match.matchWinner}
                  </p>
                )}
                {match.tossWinner && (
                  <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                    <Trophy size={12} /> Toss: {match.tossWinner}
                  </p>
                )}
                <Link href={`/match?id=${encodeURIComponent(match.id)}`} className="w-full text-center py-2 px-4 bg-[#1a365d] text-white text-xs font-bold rounded-lg hover:bg-blue-800 transition-colors">
                  FULL SCORECARD
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecentResults;
