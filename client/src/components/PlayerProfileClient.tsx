'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getPlayerInfo } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { Award, BarChart2, CalendarDays, ExternalLink, ImageOff, Newspaper, Shield, TrendingUp, Trophy, Zap } from 'lucide-react';

type PlayerStat = {
  matchtype?: string;
  stat?: string;
  value?: string | number;
};

const statValue = (stats: PlayerStat[], format: string, name: string) => {
  const normalizedName = name.toLowerCase();
  const normalizedFormat = format.toLowerCase();
  return stats.find((item) =>
    item.matchtype?.toLowerCase() === normalizedFormat &&
    item.stat?.toLowerCase() === normalizedName
  )?.value || '-';
};

const initials = (name = 'Player') => name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();

const ageFromBirthDate = (value?: string) => {
  if (!value || value === 'Not supplied') return 'Not supplied';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not supplied';
  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const birthdayPassed = now.getMonth() > date.getMonth() ||
    (now.getMonth() === date.getMonth() && now.getDate() >= date.getDate());
  if (!birthdayPassed) age -= 1;
  return `${age}`;
};

const PlayerProfile = ({ id }: { id?: string }) => {
  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayer = async () => {
      setLoading(true);
      setPlayer(null);
      try {
        const data = await getPlayerInfo(decodeURIComponent(id as string));
        setPlayer(data);
      } catch (error) {
        console.error('Error fetching player info:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPlayer();
  }, [id]);

  const stats = useMemo<PlayerStat[]>(() => Array.isArray(player?.stats) ? player.stats : [], [player]);
  const formats = useMemo(() => Array.from(new Set(stats.map((item) => item.matchtype).filter(Boolean))) as string[], [stats]);

  if (loading) return (
    <main className="min-h-screen bg-gray-50 dark:bg-black">
      <Navbar />
      <div className="p-8 text-center">Loading player profile...</div>
    </main>
  );

  if (!player) return (
    <main className="min-h-screen bg-gray-50 dark:bg-black">
      <Navbar />
      <div className="p-8 text-center">Player not found.</div>
    </main>
  );

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black">
      <Navbar />

      <div className="bg-[#1a365d] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-40 h-40 rounded-full border-4 border-blue-800 overflow-hidden bg-blue-950 flex items-center justify-center">
              {player.playerImg ? (
                <img src={player.playerImg} alt={player.name} className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <div className="text-4xl font-black">{initials(player.name)}</div>
                  <ImageOff className="mx-auto mt-3 text-blue-300" size={18} />
                </div>
              )}
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-4xl font-black mb-2">{player.name}</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 text-blue-200">
                {player.role && <span className="bg-blue-900/50 px-3 py-1 rounded-full text-xs font-bold uppercase">{player.role}</span>}
                {player.teams?.slice(0, 4).map((team: string) => (
                  <span key={team} className="bg-blue-900/50 px-3 py-1 rounded-full text-xs font-bold uppercase">{team}</span>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap justify-center gap-3 md:justify-start">
                <Link href="/#latest-news" className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-xs font-black uppercase tracking-widest text-white shadow-lg hover:bg-orange-600">
                  <Newspaper size={14} /> Latest News
                </Link>
                <Link href={`/search?q=${encodeURIComponent(`${player.name} T20`)}`} className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-[#1a365d] shadow-lg hover:bg-blue-50">
                  <Zap size={14} /> T20 Search
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                <div>
                  <span className="text-blue-300 text-[10px] uppercase font-bold tracking-widest block mb-1">Matches</span>
                  <span className="font-bold">{player.profileSummary?.matches || '-'}</span>
                </div>
                <div>
                  <span className="text-blue-300 text-[10px] uppercase font-bold tracking-widest block mb-1">Awards</span>
                  <span className="font-bold">{player.profileSummary?.awards || 0}</span>
                </div>
                <div>
                  <span className="text-blue-300 text-[10px] uppercase font-bold tracking-widest block mb-1">Batting Style</span>
                  <span className="font-bold">{player.battingStyle || 'Not supplied'}</span>
                </div>
                <div>
                  <span className="text-blue-300 text-[10px] uppercase font-bold tracking-widest block mb-1">Bowling Style</span>
                  <span className="font-bold">{player.bowlingStyle || 'Not supplied'}</span>
                </div>
                <div>
                  <span className="text-blue-300 text-[10px] uppercase font-bold tracking-widest block mb-1">Date of Birth</span>
                  <span className="font-bold">{player.dateOfBirth || 'Not supplied'}</span>
                </div>
                <div>
                  <span className="text-blue-300 text-[10px] uppercase font-bold tracking-widest block mb-1">Age</span>
                  <span className="font-bold">{ageFromBirthDate(player.dateOfBirth)}</span>
                </div>
              </div>
              {!player.playerImg && (
                <p className="mt-5 text-xs text-blue-200">{player.photoSource || 'No player photo supplied by provider.'}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {player.t20Details?.length ? (
              <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-100 dark:border-gray-600 flex items-center gap-2">
                  <Zap size={20} className="text-orange-500" />
                  <h2 className="font-bold uppercase text-sm tracking-wider">T20 Detail Match</h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {player.t20Details.map((item: any) => {
                    const body = (
                      <div className="h-full rounded-xl border border-orange-100 bg-orange-50 p-5 text-orange-950 transition-all hover:border-orange-200 hover:bg-orange-100 dark:border-orange-900 dark:bg-orange-950/20 dark:text-orange-100">
                        <p className="text-[10px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-300">{item.title}</p>
                        <p className="mt-3 text-sm font-bold leading-6">{item.value}</p>
                        {item.matchId && (
                          <p className="mt-4 inline-flex items-center gap-1 text-xs font-black uppercase tracking-widest text-orange-700 dark:text-orange-200">
                            Open Match <ExternalLink size={12} />
                          </p>
                        )}
                      </div>
                    );

                    return item.matchId ? (
                      <Link key={item.title} href={`/match?id=${encodeURIComponent(item.matchId)}`}>
                        {body}
                      </Link>
                    ) : (
                      <div key={item.title}>{body}</div>
                    );
                  })}
                </div>
              </section>
            ) : null}

            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-100 dark:border-gray-600 flex items-center gap-2">
                <BarChart2 size={20} className="text-blue-600" />
                <h2 className="font-bold uppercase text-sm tracking-wider">Career Statistics</h2>
              </div>
              <div className="p-6 overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-gray-500 font-bold border-b border-gray-100">
                    <tr>
                      <th className="pb-3">FORMAT</th>
                      <th className="pb-3">MAT</th>
                      <th className="pb-3">RUNS</th>
                      <th className="pb-3">AVG</th>
                      <th className="pb-3">SR</th>
                      <th className="pb-3">100s</th>
                      <th className="pb-3">50s</th>
                      <th className="pb-3">HS</th>
                      <th className="pb-3">WKTS</th>
                      <th className="pb-3">ECON</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {formats.map((format) => (
                      <tr key={format} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                        <td className="py-4 font-bold text-blue-600">{format}</td>
                        <td className="py-4">{statValue(stats, format, 'm')}</td>
                        <td className="py-4 font-medium">{statValue(stats, format, 'runs')}</td>
                        <td className="py-4">{statValue(stats, format, 'avg')}</td>
                        <td className="py-4 text-gray-500">{statValue(stats, format, 'sr')}</td>
                        <td className="py-4">{statValue(stats, format, '100s')}</td>
                        <td className="py-4">{statValue(stats, format, '50s')}</td>
                        <td className="py-4">{statValue(stats, format, 'hs')}</td>
                        <td className="py-4">{statValue(stats, format, 'wkts')}</td>
                        <td className="py-4">{statValue(stats, format, 'econ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-100 dark:border-gray-600 flex items-center gap-2">
                <CalendarDays size={20} className="text-orange-500" />
                <h2 className="font-bold uppercase text-sm tracking-wider">Career Timeline</h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {player.yearlySplits?.map((split: any) => (
                  <div key={split.year} className="rounded-lg border border-gray-100 dark:border-gray-700 p-4">
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">{split.year}</p>
                    <p className="mt-2 font-bold">{split.runs} runs, {split.wickets} wickets</p>
                    <p className="text-sm text-gray-500">{split.mat} matches | HS {split.hs}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-100 dark:border-gray-600 flex items-center gap-2">
                <TrendingUp size={20} className="text-green-600" />
                <h2 className="font-bold uppercase text-sm tracking-wider">Recent Form</h2>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {player.recentForm?.map((item: any) => (
                  <Link key={item.id} href={`/match?id=${encodeURIComponent(item.id)}`} className="block p-5 hover:bg-gray-50 dark:hover:bg-gray-900">
                    <p className="font-bold text-gray-900 dark:text-white">{item.match}</p>
                    <p className="text-sm text-gray-500 mt-1">{item.date} | {item.result}</p>
                    <p className="text-sm font-bold text-blue-600 mt-2">{item.runs} runs ({item.balls}b), {item.wickets} wickets</p>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="font-bold uppercase text-sm tracking-wider mb-4 flex items-center gap-2">
                <Award size={18} className="text-orange-500" /> Awards
              </h2>
              {player.awards?.length ? (
                <div className="space-y-4">
                  {player.awards.map((award: any) => (
                    <div key={`${award.match}-${award.date}`} className="rounded-lg bg-orange-50 dark:bg-orange-950/30 p-4">
                      <p className="font-black text-orange-600">{award.title}</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{award.match}</p>
                      <p className="text-xs text-gray-500 mt-1">{award.date} | {award.series}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No player-of-match awards found in the loaded Cricsheet data.</p>
              )}
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="font-bold uppercase text-sm tracking-wider mb-4 flex items-center gap-2">
                <Newspaper size={18} className="text-green-600" /> Latest News Options
              </h2>
              <div className="space-y-3">
                {(player.newsLinks || [{ title: 'Latest cricket news', href: '/#latest-news' }]).map((item: any) => (
                  <Link key={item.href} href={item.href} className="flex items-center justify-between rounded-lg bg-green-50 px-4 py-3 text-sm font-bold text-green-800 hover:bg-green-100 dark:bg-green-950/30 dark:text-green-100">
                    {item.title}
                    <ExternalLink size={14} />
                  </Link>
                ))}
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="font-bold uppercase text-sm tracking-wider mb-4 flex items-center gap-2">
                <Shield size={18} className="text-blue-600" /> Rankings
              </h2>
              <p className="text-sm text-gray-500">
                Live ICC rankings require a licensed rankings endpoint. This page shows real derived stats, awards, yearly splits, and recent form from available match data.
              </p>
            </section>

            <section className="bg-[#1a365d] text-white rounded-xl shadow-sm p-6">
              <h2 className="font-bold uppercase text-sm tracking-wider mb-4 flex items-center gap-2">
                <Trophy size={18} className="text-orange-500" /> Data Source
              </h2>
              <p className="text-sm text-blue-100">{player.profileSummary?.dataSource || 'Provider data'}</p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PlayerProfile;
