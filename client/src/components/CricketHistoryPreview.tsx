import Link from 'next/link';
import { ArrowRight, BookOpen, CalendarDays, Crown, Trophy } from 'lucide-react';

export const historyMilestones = [
  {
    year: '1877',
    title: 'First Test match',
    detail: 'Australia and England begin Test cricket at the Melbourne Cricket Ground.',
  },
  {
    year: '1975',
    title: 'First Cricket World Cup',
    detail: 'The first men ODI World Cup is staged in England, changing cricket into a global tournament product.',
  },
  {
    year: '1983',
    title: 'India win the World Cup',
    detail: 'India defeat West Indies at Lord\'s, creating one of the sport\'s most important turning points.',
  },
  {
    year: '2003',
    title: 'T20 format arrives',
    detail: 'Twenty20 cricket is launched and later reshapes leagues, broadcasting, and fan engagement.',
  },
  {
    year: '2008',
    title: 'IPL begins',
    detail: 'The Indian Premier League starts, combining elite cricket, city franchises, and year-round cricket economy.',
  },
  {
    year: '2026',
    title: 'Modern global calendar',
    detail: 'ICC events, franchise leagues, women\'s cricket, and associate competitions run side by side.',
  },
];

const CricketHistoryPreview = () => (
  <section className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900">
    <div className="mb-8 flex items-center justify-between gap-4">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-extrabold text-gray-900 dark:text-white">
          <BookOpen size={24} className="text-orange-500" /> Cricket History
        </h2>
        <p className="mt-1 text-sm text-gray-500">A fast timeline from Test cricket to the modern franchise era</p>
      </div>
      <Link href="/history" className="flex shrink-0 items-center rounded-full bg-orange-50 px-4 py-2 text-sm font-bold text-orange-600 hover:bg-orange-100">
        History Page <ArrowRight size={16} />
      </Link>
    </div>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {historyMilestones.slice(0, 6).map((item) => (
        <div key={item.year} className="rounded-xl border border-gray-100 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-950/40">
          <div className="mb-4 flex items-center justify-between">
            <span className="rounded-lg bg-white px-3 py-1 text-xs font-black text-[#1a365d] ring-1 ring-gray-100 dark:bg-gray-900 dark:text-blue-100 dark:ring-gray-800">
              {item.year}
            </span>
            {item.year === '1983' ? <Crown size={18} className="text-orange-500" /> : item.year === '1975' ? <Trophy size={18} className="text-green-600" /> : <CalendarDays size={18} className="text-blue-600" />}
          </div>
          <h3 className="font-black text-gray-900 dark:text-white">{item.title}</h3>
          <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">{item.detail}</p>
        </div>
      ))}
    </div>
  </section>
);

export default CricketHistoryPreview;
