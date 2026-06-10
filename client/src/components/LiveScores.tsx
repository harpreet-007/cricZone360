'use client';

import React, { useEffect, useState } from 'react';
import { getMatches } from '@/lib/api';
import { logClientWarning } from '@/lib/clientError';
import { asArray, CricketMatch, isLiveMatch, oversForTeam, scoreForTeam, teamName, teamShort } from '@/lib/cricket';
import socket from '@/lib/socket';
import { MapPin, Clock, ChevronRight, Radio, MessageSquareText } from 'lucide-react';
import Link from 'next/link';

const TeamLogo = ({ match, index, tone }: { match: CricketMatch; index: number; tone: 'blue' | 'yellow' }) => {
  const image = match.teamInfo?.[index]?.img;
  const toneClass = tone === 'blue'
    ? 'bg-blue-50 text-blue-700 ring-blue-100 group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-950/40 dark:ring-blue-900/60'
    : 'bg-amber-50 text-amber-700 ring-amber-100 group-hover:bg-amber-500 group-hover:text-white dark:bg-amber-950/40 dark:ring-amber-900/60';

  return (
    <div className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl font-black shadow-sm ring-1 transition-all duration-300 ${toneClass}`}>
      {image ? (
        <img src={image} alt={`${teamName(match, index)} logo`} className="h-full w-full object-cover" />
      ) : (
        teamShort(match, index)
      )}
    </div>
  );
};

const LiveScores = () => {
  const [matches, setMatches] = useState<CricketMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const data = await getMatches({ feed: 'live' });
        const liveMatches = asArray<CricketMatch>(data).filter(isLiveMatch);
        setMatches(liveMatches);
      } catch (error) {
        logClientWarning('Error fetching live matches', error);
        setError('Live cricket feed is unavailable. Check the backend/API key connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
    const interval = window.setInterval(fetchMatches, 30000);

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
      window.clearInterval(interval);
      socket.off('matchUpdate');
    };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="cz-shimmer rounded-2xl h-64 border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900"></div>
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
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No live matches currently available.</h3>
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
          <div key={match.id} className="cz-card-motion group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_24px_60px_rgba(15,23,42,0.14)] dark:border-gray-800 dark:bg-gray-900/95 dark:shadow-black/30">
            <div className="absolute inset-x-0 top-0 h-1 bg-red-500"></div>
            <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-red-500/5"></div>
            
            <div className="flex justify-between items-start mb-6">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{match.series}</span>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-tighter text-red-600 ring-1 ring-red-100 dark:bg-red-950/40 dark:ring-red-900/60 animate-pulse">LIVE</span>
              </div>
            </div>
            
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <TeamLogo match={match} index={0} tone="blue" />
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
                  <TeamLogo match={match} index={1} tone="yellow" />
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
