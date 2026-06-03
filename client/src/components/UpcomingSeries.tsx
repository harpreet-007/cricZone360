'use client';

import Link from 'next/link';
import { ArrowRight, CalendarClock, Globe2, Trophy } from 'lucide-react';

const seriesItems = [
  {
    name: 'ICC Women\'s T20 World Cup 2026',
    dates: '12 Jun - 5 Jul 2026',
    venue: 'England',
    format: '33 T20I matches',
    href: '/search?q=ICC%20Women%27s%20T20%20World%20Cup',
  },
  {
    name: 'Sri Lanka tour of West Indies',
    dates: 'Jun - Jul 2026',
    venue: 'West Indies',
    format: '3 ODIs, 3 T20Is, 2 Tests',
    href: '/search?q=Sri%20Lanka%20West%20Indies',
  },
  {
    name: 'ICC CWC League 2',
    dates: 'June 2026 window',
    venue: 'Canada and associate venues',
    format: 'ODI league fixtures',
    href: '/search?q=ICC%20CWC%20League%202',
  },
];

const UpcomingSeries = () => (
  <section className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900">
    <div className="mb-8 flex items-center justify-between gap-4">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-extrabold text-gray-900 dark:text-white">
          <CalendarClock size={24} className="text-blue-600" /> Upcoming Series
        </h2>
        <p className="mt-1 text-sm text-gray-500">Major upcoming cricket windows and tournament blocks</p>
      </div>
      <Link href="/search?q=schedule" className="flex shrink-0 items-center rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-100">
        Schedule <ArrowRight size={16} />
      </Link>
    </div>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {seriesItems.map((item) => (
        <Link key={item.name} href={item.href} className="group rounded-xl border border-gray-100 bg-gray-50 p-5 transition-all hover:border-blue-200 hover:bg-blue-50 dark:border-gray-800 dark:bg-gray-950/40 dark:hover:bg-blue-900/10">
          <div className="mb-5 flex items-center justify-between">
            <span className="rounded-lg bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-gray-500 ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
              {item.dates}
            </span>
            <Trophy size={18} className="text-orange-500" />
          </div>
          <h3 className="text-base font-black text-gray-900 group-hover:text-blue-700 dark:text-white">{item.name}</h3>
          <p className="mt-3 flex items-center gap-2 text-xs font-bold text-gray-500">
            <Globe2 size={13} /> {item.venue}
          </p>
          <p className="mt-2 text-sm font-bold text-gray-700 dark:text-gray-300">{item.format}</p>
        </Link>
      ))}
    </div>
  </section>
);

export default UpcomingSeries;
