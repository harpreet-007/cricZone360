'use client';

import React, { useEffect, useState } from 'react';
import { getMatches } from '@/lib/api';
import { logClientWarning } from '@/lib/clientError';
import { asArray, CricketMatch, formatMatchDateTime, scoreForTeam, sortByDateDesc, teamName, teamShort } from '@/lib/cricket';
import { MapPin, Trophy, Zap } from 'lucide-react';
import Link from 'next/link';

const tournamentOptions = [
  { label: 'All Tournaments', value: 'all' },
  { label: 'IPL', value: 'ipl' },
  { label: 'WPL', value: 'wpl' },
  { label: 'ICC Cricket World Cup', value: 'icc-world-cup' },
  { label: "ICC Women's U19 T20 World Cup", value: 'u19-womens-world-cup' },
  { label: 'ICC U19 Cricket World Cup', value: 'u19-world-cup' },
  { label: 'The Ashes', value: 'the-ashes' },
  { label: 'Other Supported Series', value: 'other' },
];

const TeamLogo = ({ match, index, winner }: { match: CricketMatch; index: number; winner: boolean }) => {
  const image = match.teamInfo?.[index]?.img;
  const className = winner
    ? 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:ring-emerald-800'
    : 'bg-gray-50 text-gray-500 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700';

  return (
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl font-black shadow-sm ring-1 ${className}`}>
      {image ? <img src={image} alt={`${teamName(match, index)} logo`} className="h-full w-full object-cover" /> : teamShort(match, index)}
    </div>
  );
};

const RecentResults = () => {
  const [matches, setMatches] = useState<CricketMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTournament, setSelectedTournament] = useState('all');

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        const data = await getMatches({ feed: 'recent', tournament: selectedTournament });
        const ended = sortByDateDesc(asArray<CricketMatch>(data).filter((match) =>
          match.matchEnded &&
          (match.teams || []).length >= 2 &&
          (match.score || []).length > 0
        )).slice(0, 6);
        setMatches(ended);
      } catch (error) {
        logClientWarning('Error fetching recent results', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [selectedTournament]);

  return (
    <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h2 className="text-2xl font-extrabold flex items-center gap-2 text-gray-900 dark:text-white">
            <Zap size={24} className="text-orange-500" /> Recent Results
          </h2>
          <p className="text-sm text-gray-500 mt-1">Latest completed matches from supported cricket data feeds</p>
        </div>
        <label className="flex flex-col gap-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
          Tournament
          <select
            value={selectedTournament}
            onChange={(event) => setSelectedTournament(event.target.value)}
            className="min-w-64 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-bold normal-case tracking-normal text-gray-800 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
          >
            {tournamentOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="cz-shimmer rounded-2xl h-32 border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900"></div>
          ))}
        </div>
      ) : matches.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 p-10 text-center text-sm font-bold text-gray-500 dark:border-gray-800">
          No recent results available.
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
          <div key={match.id} className="cz-card-motion group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:scale-[1.005] hover:shadow-xl dark:border-gray-800 dark:bg-gray-950/70 dark:hover:border-emerald-900">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase mb-3">
                  <span className="truncate max-w-[240px]">Tournament: {match.series || 'Unavailable'}</span>
                  <span>|</span>
                  <span>Ended {formatMatchDateTime(match.dateTimeGMT || match.date).date}</span>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-black text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:ring-emerald-800">RESULT</span>
                </div>
                <div className="space-y-3">
                  {[0, 1].map((index) => {
                    const isWinner = Boolean(match.matchWinner && teamName(match, index).toLowerCase() === match.matchWinner.toLowerCase());
                    return (
                    <div key={index} className={`flex items-center justify-between rounded-xl p-2 transition ${isWinner ? 'bg-emerald-50/80 dark:bg-emerald-950/20' : ''}`}>
                      <div className="flex items-center gap-3">
                        <TeamLogo match={match} index={index} winner={isWinner} />
                        <span className={`font-bold ${isWinner ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-900 dark:text-white'}`}>{teamName(match, index)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] block text-gray-400 font-bold uppercase">Final Score</span>
                        <span className="font-bold text-lg">{scoreForTeam(match, index)}</span>
                      </div>
                    </div>
                  )})}
                </div>
              </div>
              <div className="md:w-64 flex flex-col items-center md:items-end justify-center border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-800 pt-4 md:pt-0 md:pl-6">
                <p className="text-blue-600 font-bold text-sm mb-2 text-center md:text-right">Result: {match.status || 'Result unavailable'}</p>
                {match.matchWinner && (
                  <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                    <Trophy size={12} /> Winner: {match.matchWinner}
                  </p>
                )}
                {match.tossWinner && (
                  <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                    <Trophy size={12} /> Toss: {match.tossWinner}
                  </p>
                )}
                {match.venue && (
                  <p className="text-xs text-gray-500 mb-4 flex items-center gap-1 text-center md:text-right">
                    <MapPin size={12} /> {match.venue}
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
      )}
    </section>
  );
};

export default RecentResults;
