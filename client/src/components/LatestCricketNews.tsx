'use client';

import Link from 'next/link';
import { ArrowUpRight, CalendarDays, Newspaper, Radio, ShieldAlert, Trophy } from 'lucide-react';

const newsItems = [
  {
    title: 'ICC Women\'s T20 World Cup enters the June cricket window',
    source: 'ICC',
    time: '12 Jun - 5 Jul 2026',
    summary: 'The women\'s global T20 event is a headline series in England, with 33 T20I fixtures across the tournament window.',
    href: 'https://www.icc-cricket.com/news/index',
    tone: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  },
  {
    title: 'Cricket Canada suspended over membership obligation breaches',
    source: 'The Guardian',
    time: '2 Jun 2026',
    summary: 'The ICC suspended Cricket Canada after citing serious breaches, adding another governance story to the week.',
    href: 'https://www.theguardian.com/world/2026/jun/02/cricket-canada-suspension',
    tone: 'text-red-600 bg-red-50 dark:bg-red-900/20',
  },
  {
    title: 'ICC CWC League 2 fixtures continue through June',
    source: 'NDTV Sports',
    time: 'June 2026',
    summary: 'Associate ODI cricket remains active through Cricket World Cup League 2 fixtures, including Canada, USA and Netherlands windows.',
    href: 'https://sports.ndtv.com/cricket/schedules-fixtures',
    tone: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
  },
  {
    title: 'Sri Lanka set for all-format West Indies tour',
    source: 'ICC',
    time: 'Tour window: Jun-Jul 2026',
    summary: 'Sri Lanka are scheduled for ODIs, T20Is, and Tests against West Indies during the June-July tour window.',
    href: 'https://www.icc-cricket.com/news/sri-lanka-set-for-all-format-tour-of-west-indies/',
    tone: 'text-green-600 bg-green-50 dark:bg-green-900/20',
  },
];

const LatestCricketNews = () => (
  <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
    <div className="mb-8 flex items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl font-extrabold flex items-center gap-2 text-gray-900 dark:text-white">
          <Newspaper size={24} className="text-orange-500" /> Latest Cricket News
        </h2>
        <p className="text-sm text-gray-500 mt-1">News, upcoming matches, and series notes curated for today</p>
      </div>
      <Link href="https://www.icc-cricket.com/news/index" className="shrink-0 text-blue-600 text-sm font-bold hover:underline flex items-center bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full">
        ICC News <ArrowUpRight size={16} />
      </Link>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {newsItems.map((item) => (
        <Link
          key={item.title}
          href={item.href}
          className="group flex h-full flex-col rounded-xl border border-gray-100 p-5 transition-all hover:border-orange-200 hover:bg-orange-50/40 dark:border-gray-800 dark:hover:border-orange-900 dark:hover:bg-orange-900/10"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${item.tone}`}>
              <Radio size={11} /> {item.source}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{item.time}</span>
          </div>
          <h3 className="text-base font-black leading-snug text-gray-900 group-hover:text-orange-600 dark:text-white">
            {item.title}
          </h3>
          <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400">{item.summary}</p>
          <div className="mt-5 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400">
            <ShieldAlert size={13} /> Source linked
          </div>
        </Link>
      ))}
    </div>

    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="rounded-xl bg-[#1a365d] p-5 text-white">
        <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-200">
          <CalendarDays size={14} className="text-orange-400" /> Upcoming Match
        </div>
        <h3 className="text-lg font-black">USA vs Netherlands</h3>
        <p className="mt-2 text-sm text-blue-100">ICC CWC League 2, Match 114 - Maple Leaf North-West Ground, King City.</p>
      </div>
      <div className="rounded-xl bg-orange-50 p-5 text-orange-950 ring-1 ring-orange-100 dark:bg-orange-950/20 dark:text-orange-100 dark:ring-orange-900">
        <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-orange-600 dark:text-orange-300">
          <Trophy size={14} /> Series Watch
        </div>
        <h3 className="text-lg font-black">Sri Lanka tour of West Indies</h3>
        <p className="mt-2 text-sm">All-format tour scheduled for the June-July window: ODIs, T20Is and Tests.</p>
      </div>
    </div>
  </section>
);

export default LatestCricketNews;
