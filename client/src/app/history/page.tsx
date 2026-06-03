import Navbar from '@/components/Navbar';
import CricketHistoryPreview, { historyMilestones } from '@/components/CricketHistoryPreview';
import { BookOpen, Crown, Database, ShieldCheck, Trophy } from 'lucide-react';
import Link from 'next/link';

const formatBlocks = [
  {
    title: 'Test Cricket',
    detail: 'The oldest international format, built around multi-day skill, patience, bowling spells, and match conditions.',
  },
  {
    title: 'ODI Cricket',
    detail: 'The World Cup format that turned limited-overs cricket into a global television product.',
  },
  {
    title: 'T20 Cricket',
    detail: 'The fast format that expanded franchise leagues, tactical roles, power hitting, and global audience reach.',
  },
  {
    title: 'Women\'s Cricket',
    detail: 'A rapidly growing professional pathway, with ICC events and domestic leagues creating new stars and deeper calendars.',
  },
];

export default function HistoryPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      <Navbar />

      <section className="bg-[#10233f] text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-blue-100">
              <BookOpen size={14} className="text-orange-400" /> Cricket archive
            </div>
            <h1 className="text-4xl font-black tracking-tight md:text-6xl">Cricket History</h1>
            <p className="mt-5 text-base leading-7 text-blue-100 md:text-lg">
              From the first Test match in 1877 to World Cups, T20 leagues, women\'s cricket growth, and the modern data-led calendar.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
        <CricketHistoryPreview />

        <section className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-8">
            <h2 className="flex items-center gap-2 text-2xl font-black text-gray-900 dark:text-white">
              <Trophy size={24} className="text-orange-500" /> Era Timeline
            </h2>
            <p className="mt-1 text-sm text-gray-500">Key eras that shaped cricket into today\'s global sport</p>
          </div>

          <div className="space-y-4">
            {historyMilestones.map((item) => (
              <div key={item.year} className="grid gap-4 rounded-xl border border-gray-100 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-950/40 md:grid-cols-[110px_1fr]">
                <div className="text-3xl font-black text-[#1a365d] dark:text-blue-100">{item.year}</div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-[#1a365d] p-8 text-white shadow-xl">
            <Crown size={30} className="mb-5 text-orange-400" />
            <h2 className="text-2xl font-black">World Cup Legacy</h2>
            <p className="mt-3 text-sm leading-7 text-blue-100">
              World Cups created cricket\'s biggest national-team stage: the 1975 launch, India\'s 1983 win, Australia\'s dominance, and the rise of T20 world events all changed how fans follow the sport.
            </p>
            <Link href="/search?q=ICC%20World%20Cup" className="mt-6 inline-flex rounded-lg bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-[#1a365d]">
              Search World Cups
            </Link>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900">
            <Database size={30} className="mb-5 text-blue-600" />
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Formats And Leagues</h2>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {formatBlocks.map((item) => (
                <div key={item.title} className="rounded-xl bg-gray-50 p-4 dark:bg-gray-950/40">
                  <h3 className="font-black text-gray-900 dark:text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-green-100 bg-green-50 p-6 text-green-950 dark:border-green-900 dark:bg-green-950/20 dark:text-green-100">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 shrink-0 text-green-600" />
            <p className="text-sm leading-6">
              This page is editorial context for navigation and learning. Match records, scorecards, and player pages remain loaded through backend data routes wherever available.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
