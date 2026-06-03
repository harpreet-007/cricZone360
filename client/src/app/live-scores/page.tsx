import Navbar from '@/components/Navbar';
import LiveScores from '@/components/LiveScores';
import RecentResults from '@/components/RecentResults';
import UpcomingMatches from '@/components/UpcomingMatches';
import { Activity, CalendarClock, Radio, Search, Trophy, Zap } from 'lucide-react';
import Link from 'next/link';

const scoreTools = [
  {
    title: 'Live Matches',
    value: 'Live',
    description: 'Ball-by-ball status and score updates when the provider has active matches.',
    href: '#live-matches',
    icon: Radio,
  },
  {
    title: 'Upcoming Matches',
    value: 'Upcoming',
    description: 'Fixtures, venues, start times, teams, and schedule windows.',
    href: '#upcoming-matches',
    icon: CalendarClock,
  },
  {
    title: 'Recent Results',
    value: 'Completed',
    description: 'Completed match scores, winners, scorecards, and match detail links.',
    href: '#recent-results',
    icon: Trophy,
  },
];

export default function LiveScoresPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 rounded-2xl bg-[#10233f] p-8 text-white shadow-xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-blue-100">
            <Activity size={15} className="text-red-400" /> Live Cricket Desk
          </div>
          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_300px] lg:items-end">
            <div>
              <h1 className="max-w-3xl text-4xl font-black tracking-tight md:text-5xl">
                Live Scores, Fixtures, and Results
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100 md:text-base">
                Track live matches, upcoming schedules, completed results, score updates, statuses, and full match details from one page.
              </p>
            </div>
            <Link
              href="/search?q=cricket"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg transition hover:bg-orange-600"
            >
              <Search size={15} /> Search Cricket
            </Link>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {scoreTools.map((tool) => (
            <Link
              key={tool.title}
              href={tool.href}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/30">
                  <tool.icon size={20} />
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:bg-gray-800">
                  {tool.value}
                </span>
              </div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white">{tool.title}</h2>
              <p className="mt-2 text-sm leading-6 text-gray-500">{tool.description}</p>
            </Link>
          ))}
        </section>

        <div className="space-y-10">
          <section id="live-matches" className="scroll-mt-24">
            <LiveScores />
          </section>

          <section id="upcoming-matches" className="scroll-mt-24">
            <UpcomingMatches />
          </section>

          <section id="recent-results" className="scroll-mt-24">
            <RecentResults />
          </section>
        </div>

        <section className="mt-10 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-black text-gray-900 dark:text-white">
                <Zap size={19} className="text-orange-500" /> Match Status Guide
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Live means in progress, Completed means result available, and Upcoming means scheduled fixture or preview.
              </p>
            </div>
            <Link href="/search?q=results" className="rounded-xl bg-[#1a365d] px-5 py-3 text-center text-xs font-black uppercase tracking-widest text-white hover:bg-blue-800">
              Browse All Results
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
