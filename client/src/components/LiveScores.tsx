'use client';

import React, { useEffect, useState } from 'react';
import { getMatches } from '@/lib/api';
import { logClientWarning } from '@/lib/clientError';
import { asArray, CricketMatch, oversForTeam, scoreForTeam, teamName, teamShort } from '@/lib/cricket';
import socket from '@/lib/socket';
import { MapPin, Clock, ChevronRight, Radio, MessageSquareText } from 'lucide-react';
import Link from 'next/link';

const LiveScores = () => {
  const [matches, setMatches] = useState<CricketMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const data = await getMatches();
        const liveMatches = asArray<CricketMatch>(data).filter((m) => m.matchStarted && !m.matchEnded);
        setMatches(liveMatches);
      } catch (error) {
        logClientWarning('Error fetching live matches', error);
        setError('Live cricket feed is unavailable. Check the backend/API key connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();

    // Listen for real-time updates
    socket.on('matchUpdate', (updatedMatch: CricketMatch) => {
      setMatches((prevMatches) => {
        const index = prevMatches.findIndex((m) => m.id === updatedMatch.id);
        if (index !== -1) {
          const newMatches = [...prevMatches];
          newMatches[index] = updatedMatch;
          return newMatches;
        } else if (updatedMatch.matchStarted && !updatedMatch.matchEnded) {
          return [...prevMatches, updatedMatch];
        }
        return prevMatches;
      });
    });

    return () => {
      socket.off('matchUpdate');
    };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-white dark:bg-gray-900 rounded-2xl h-64 border border-gray-100 dark:border-gray-800"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-red-100 dark:border-red-900/40 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Live Feed Not Connected</h3>
        <p className="text-sm text-gray-500">{error}</p>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="text-gray-400" size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Matches Live Right Now</h3>
        <p className="text-gray-500 max-w-xs mx-auto text-sm">Check the upcoming section for the next thrill or view recent results.</p>
        <button className="mt-6 text-blue-600 font-bold text-sm hover:underline">View Full Schedule</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold flex items-center gap-3 text-gray-900 dark:text-white">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            Live Matches
          </h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">Real-time updates from stadiums around the globe</p>
        </div>
        <Link href="/#live-scores" className="text-blue-600 text-sm font-bold hover:underline flex items-center bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full">
          All Live <ChevronRight size={16} />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {matches.map((match) => (
          <div key={match.id} className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-800 hover:shadow-2xl transition-all duration-300 group cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>
            
            <div className="flex justify-between items-start mb-6">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{match.series}</span>
              <div className="flex items-center gap-2">
                <span className="bg-red-50 dark:bg-red-900/20 text-red-600 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter animate-pulse">Live</span>
              </div>
            </div>
            
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center font-black text-gray-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    {teamShort(match, 0)}
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">{teamName(match, 0)}</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-xl text-gray-900 dark:text-white">
                    {scoreForTeam(match, 0)}
                  </span>
                  <span className="text-[10px] block text-gray-400 font-bold uppercase tracking-tighter mt-1">
                    {oversForTeam(match, 0)}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center font-black text-gray-400 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                    {teamShort(match, 1)}
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">{teamName(match, 1)}</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-xl text-gray-900 dark:text-white">
                    {scoreForTeam(match, 1)}
                  </span>
                  <span className="text-[10px] block text-gray-400 font-bold uppercase tracking-tighter mt-1">
                    {oversForTeam(match, 1)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-50 dark:border-gray-800">
              <p className="text-sm text-blue-600 font-black mb-4 group-hover:translate-x-1 transition-transform">{match.status}</p>
              <div className="mb-4 grid grid-cols-1 gap-2 text-[11px] text-gray-500">
                {match.tossWinner && (
                  <span className="flex items-center gap-1.5">
                    <Radio size={12} className="text-orange-500" /> Toss: {match.tossWinner} chose to {match.tossChoice || 'field/bat'}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <MessageSquareText size={12} className="text-orange-500" /> Commentary: open full stats for provider updates
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><MapPin size={12} className="text-gray-300" /> {match.venue}</span>
                <Link href={`/match?id=${encodeURIComponent(match.id)}`} className="flex items-center gap-1 text-orange-500 hover:text-orange-600">
                  Full Stats <ChevronRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveScores;
