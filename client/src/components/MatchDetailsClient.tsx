'use client';

import React, { useEffect, useState } from 'react';
import { getMatchInfo, getScorecard } from '@/lib/api';
import { logClientWarning } from '@/lib/clientError';
import { oversForTeam, scoreForTeam, teamName, teamShort } from '@/lib/cricket';
import Navbar from '@/components/Navbar';
import { Trophy, MapPin, Calendar, Info, Clock, Users, ChevronDown, ChevronUp, Database, MessageSquareText } from 'lucide-react';

const isValidMatchId = (value?: string) => {
  const id = String(value || '').trim();
  return Boolean(id) && !id.includes('.') && !id.includes('/') && id !== 'index';
};

const isMatchPayload = (value: any) =>
  value && !Array.isArray(value) && typeof value === 'object' && Boolean(value.id || value.name || value.teams?.length);

const MatchDetails = ({ id }: { id?: string }) => {
  const [match, setMatch] = useState<any>(null);
  const [scorecard, setScorecard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('scorecard');
  const [expandedInnings, setExpandedInnings] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setMatch(null);
      setScorecard(null);
      if (!isValidMatchId(id)) {
        setLoading(false);
        return;
      }
      try {
        const [matchData, scorecardData] = await Promise.all([
          getMatchInfo(decodeURIComponent(id as string)),
          getScorecard(decodeURIComponent(id as string))
        ]);
        setMatch(isMatchPayload(matchData) ? matchData : null);
        setScorecard(isMatchPayload(scorecardData) ? scorecardData : null);
        setLoading(false);
      } catch (error) {
        logClientWarning('Error fetching match details', error);
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Match Data...</p>
      </div>
    </div>
  );

  if (!match) return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Match Not Found</h1>
        <p className="text-gray-500 mt-2">The match you are looking for does not exist or has been removed.</p>
      </div>
    </div>
  );

  const matchTime = match.scheduledTime || (match.dateTimeGMT ? new Date(match.dateTimeGMT).toLocaleTimeString() : 'Time unavailable');
  const scorecardData = scorecard?.scorecard || match.scorecard || [];
  const commentaryData = scorecard?.commentary || match.commentary || [];
  const squadsData = match.squads || [];
  const highlightsData = match.highlights || [];

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      <Navbar />
      
      {/* Header Section */}
      <div className="bg-[#1a365d] text-white py-12 border-b border-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">
                  {match.matchType || 'Match'}
                </span>
                <span className="text-blue-300 text-[10px] font-black uppercase tracking-widest truncate max-w-[200px]">
                  {match.series}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black italic tracking-tight mb-6">{match.name}</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-6 text-xs font-bold text-blue-200">
                <span className="flex items-center gap-2 bg-blue-900/40 px-3 py-2 rounded-lg border border-blue-800/50">
                  <MapPin size={14} className="text-orange-500" /> {match.venue}
                </span>
                <span className="flex items-center gap-2 bg-blue-900/40 px-3 py-2 rounded-lg border border-blue-800/50">
                  <Calendar size={14} className="text-orange-500" /> {match.date}
                </span>
                <span className="flex items-center gap-2 bg-blue-900/40 px-3 py-2 rounded-lg border border-blue-800/50">
                  <Clock size={14} className="text-orange-500" /> {matchTime}
                </span>
              </div>
            </div>
            
            <div className="bg-[#0f172a] p-8 rounded-3xl border border-blue-800/50 shadow-2xl w-full md:w-auto min-w-[350px] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Trophy size={100} />
              </div>
              <div className="relative z-10">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-900/50 rounded-xl flex items-center justify-center font-black text-blue-300 border border-blue-700/50">
                        {teamShort(match, 0)}
                      </div>
                      <span className="font-black text-lg">{teamName(match, 0)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black tracking-tighter">
                        {scoreForTeam(match, 0)}
                      </span>
                      <span className="text-[10px] block text-blue-400 font-bold uppercase tracking-tighter">
                        {oversForTeam(match, 0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-yellow-900/20 rounded-xl flex items-center justify-center font-black text-yellow-300 border border-yellow-700/50">
                        {teamShort(match, 1)}
                      </div>
                      <span className="font-black text-lg">{teamName(match, 1)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black tracking-tighter">
                        {scoreForTeam(match, 1)}
                      </span>
                      <span className="text-[10px] block text-blue-400 font-bold uppercase tracking-tighter">
                        {oversForTeam(match, 1)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-blue-800/50 text-center">
                  <p className="text-orange-500 font-black text-sm uppercase tracking-widest animate-pulse">
                    {match.status}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-16 bg-white dark:bg-[#0f172a] border-b border-gray-100 dark:border-gray-800 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto no-scrollbar gap-2">
            {['scorecard', 'commentary', 'info', 'squads', 'highlights'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-5 text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all relative ${
                  activeTab === tab 
                  ? 'text-orange-500' 
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-orange-500 rounded-t-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-10">
            
            {activeTab === 'scorecard' && (
              <div className="space-y-6">
                {scorecardData.length > 0 ? (
                  scorecardData.map((inning: any, idx: number) => (
                    <div key={idx} className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                      <button 
                        onClick={() => setExpandedInnings(expandedInnings === idx ? -1 : idx)}
                        className="w-full flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">
                            {inning.inning}
                          </h3>
                          <span className="text-sm font-bold text-gray-400">{inning.totals?.runs}/{inning.totals?.wickets} ({inning.totals?.overs} Ov)</span>
                        </div>
                        {expandedInnings === idx ? <ChevronUp /> : <ChevronDown />}
                      </button>
                      
                      {expandedInnings === idx && (
                        <div className="p-2 md:p-6">
                          {/* Batting Table */}
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">
                                  <th className="text-left py-4 px-2">Batter</th>
                                  <th className="text-left py-4 px-2">Dismissal</th>
                                  <th className="text-right py-4 px-2">R</th>
                                  <th className="text-right py-4 px-2">B</th>
                                  <th className="text-right py-4 px-2">4s</th>
                                  <th className="text-right py-4 px-2">6s</th>
                                  <th className="text-right py-4 px-2">SR</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                                {inning.batting?.map((player: any, pIdx: number) => (
                                  <tr key={pIdx} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                    <td className="py-4 px-2 font-bold text-blue-600 dark:text-blue-400">{player.name}</td>
                                    <td className="py-4 px-2 text-xs text-gray-500 dark:text-gray-400">{player.dismissal}</td>
                                    <td className="py-4 px-2 text-right font-black">{player.r}</td>
                                    <td className="py-4 px-2 text-right text-gray-500">{player.b}</td>
                                    <td className="py-4 px-2 text-right text-gray-500">{player['4s']}</td>
                                    <td className="py-4 px-2 text-right text-gray-500">{player['6s']}</td>
                                    <td className="py-4 px-2 text-right font-bold text-gray-400">{player.sr}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          
                          {/* Extras & Totals */}
                          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/30 rounded-2xl flex flex-wrap justify-between items-center gap-4 text-xs font-bold uppercase tracking-widest text-gray-500">
                            <div>Extras: <span className="text-gray-900 dark:text-white ml-2">{inning.totals?.extras || 0}</span></div>
                            <div className="text-sm">Total: <span className="text-xl font-black text-gray-900 dark:text-white ml-2">{inning.totals?.runs}/{inning.totals?.wickets}</span> ({inning.totals?.overs} Ov)</div>
                          </div>

                          {/* Bowling Table */}
                          <div className="mt-10 overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">
                                  <th className="text-left py-4 px-2">Bowler</th>
                                  <th className="text-right py-4 px-2">O</th>
                                  <th className="text-right py-4 px-2">M</th>
                                  <th className="text-right py-4 px-2">R</th>
                                  <th className="text-right py-4 px-2">W</th>
                                  <th className="text-right py-4 px-2">NB</th>
                                  <th className="text-right py-4 px-2">WD</th>
                                  <th className="text-right py-4 px-2">ECO</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                                {inning.bowling?.map((player: any, pIdx: number) => (
                                  <tr key={pIdx} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                    <td className="py-4 px-2 font-bold text-orange-600 dark:text-orange-400">{player.name}</td>
                                    <td className="py-4 px-2 text-right font-black">{player.o}</td>
                                    <td className="py-4 px-2 text-right text-gray-500">{player.m}</td>
                                    <td className="py-4 px-2 text-right text-gray-500">{player.r}</td>
                                    <td className="py-4 px-2 text-right font-black text-gray-900 dark:text-white">{player.w}</td>
                                    <td className="py-4 px-2 text-right text-gray-500">{player.nb}</td>
                                    <td className="py-4 px-2 text-right text-gray-500">{player.wd}</td>
                                    <td className="py-4 px-2 text-right font-bold text-gray-400">{player.eco}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="bg-white dark:bg-gray-900 rounded-3xl p-20 text-center border border-gray-100 dark:border-gray-800 shadow-xl">
                    <p className="text-gray-500 font-bold italic">Scorecard will be available shortly after the match begins.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'commentary' && (
              <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1 h-8 bg-orange-500 rounded-full"></div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Live Commentary</h3>
                </div>
                {commentaryData.length > 0 ? (
                  <div className="space-y-8">
                    {commentaryData.map((item: any, i: number) => (
                      <div key={i} className="flex gap-6 group">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs border bg-gray-100 dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700">
                            {item.event || item.score || item.over || i + 1}
                          </div>
                          <div className="w-px h-full bg-gray-100 dark:bg-gray-800 mt-2"></div>
                        </div>
                        <div className="pb-8">
                          <span className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">
                            {item.over ? `Over ${item.over}` : 'Provider commentary'}
                          </span>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                            {item.text || item.commentary || item.description || JSON.stringify(item)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 p-10 text-center">
                    <MessageSquareText className="mx-auto mb-4 text-orange-500" size={32} />
                    <p className="font-bold text-gray-900 dark:text-white">Commentary is not available from the current provider response.</p>
                    <p className="text-sm text-gray-500 mt-2">No synthetic ball-by-ball text is shown.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'info' && (
              <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-10">
                <h3 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
                  <Info size={24} className="text-blue-600" /> Detailed Match Info
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  {[
                    { label: 'Match', value: match.name },
                    { label: 'Series', value: match.series },
                    { label: 'Date', value: match.date },
                    { label: 'Venue', value: match.venue },
                    { label: 'Toss', value: match.tossWinner ? `${match.tossWinner} won and chose to ${match.tossChoice}` : 'Pending' },
                    { label: 'Umpires', value: match.umpires || 'TBA' },
                    { label: 'Match Referee', value: match.referee || 'TBA' },
                    { label: 'Status', value: match.status },
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col py-3 border-b border-gray-50 dark:border-gray-800">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.label}</span>
                      <span className="font-bold text-gray-900 dark:text-gray-100">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'squads' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {squadsData.length > 0 ? squadsData.map((squad: any) => (
                  <div key={squad.team} className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                      <Users size={20} className="text-orange-500" /> {squad.team}
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      {squad.players?.map((player: string) => (
                        <div key={player} className="rounded-xl bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm font-bold text-gray-800 dark:text-gray-100">
                          {player}
                        </div>
                      ))}
                    </div>
                  </div>
                )) : (
                  <div className="md:col-span-2 bg-white dark:bg-gray-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-800 shadow-xl">
                    <p className="text-gray-500 font-bold">Squad data is unavailable for this match.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'highlights' && (
              <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
                <h3 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
                  <Trophy size={24} className="text-orange-500" /> Match Highlights
                </h3>
                {highlightsData.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {highlightsData.map((item: any) => (
                      <div key={item.title} className="rounded-2xl bg-gray-50 dark:bg-gray-800 p-5 border border-gray-100 dark:border-gray-700">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{item.title}</p>
                        <p className="text-lg font-black text-gray-900 dark:text-white">{item.value}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Highlights are unavailable for this match.</p>
                )}
              </div>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="space-y-10">
            {/* Partnership Widget */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                <Users size={14} className="text-orange-500" /> Current Partnership
              </h3>
              <p className="text-sm text-gray-500">The current API response does not expose live partnership data for this match.</p>
            </div>

            {/* Win Probability */}
            <div className="bg-[#1a365d] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
              <h3 className="text-xs font-black uppercase tracking-widest text-blue-300 mb-6">Predictive Data</h3>
              <Database className="text-orange-500 mb-4" size={28} />
              <p className="text-sm text-blue-100">Win probability requires a licensed predictive endpoint. This build does not invent percentages.</p>
            </div>

            {/* Match Highlights CTA */}
            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-8 text-white shadow-xl group cursor-pointer relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-black text-xl mb-2 italic">MATCH HIGHLIGHTS</h3>
                <p className="text-xs text-orange-100 mb-6 font-medium">Highlights are shown only when a provider supplies video or event assets for this match.</p>
                <span className="inline-block bg-white text-orange-600 text-[10px] font-black px-6 py-3 rounded-xl uppercase tracking-widest shadow-lg">
                  Provider asset unavailable
                </span>
              </div>
              <Trophy className="absolute -bottom-6 -right-6 w-32 h-32 text-white/10 group-hover:rotate-12 transition-transform duration-500" />
            </div>
          </div>

        </div>
      </div>
    </main>
  );
};

export default MatchDetails;
