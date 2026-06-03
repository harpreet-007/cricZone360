import Navbar from '@/components/Navbar';
import LatestCricketNews from '@/components/LatestCricketNews';
import UpcomingSeries from '@/components/UpcomingSeries';
import { ArrowUpRight, Bell, Newspaper, ShieldAlert, Trophy, UserRound, Zap } from 'lucide-react';
import Link from 'next/link';

const categories = [
  {
    title: 'IPL News',
    summary: 'Season updates, squads, auction movement, scorecards, and playoff storylines.',
    href: '/search?q=IPL',
    icon: Trophy,
    tone: 'text-orange-600 bg-orange-50 dark:bg-orange-950/30',
  },
  {
    title: 'WPL News',
    summary: 'Women\'s Premier League fixtures, team news, winners, and match reports.',
    href: '/search?q=WPL&tournament=wpl',
    icon: Zap,
    tone: 'text-pink-600 bg-pink-50 dark:bg-pink-950/30',
  },
  {
    title: 'ICC Events News',
    summary: 'World Cups, U19 tournaments, Champions Trophy, and global ICC schedule notes.',
    href: '/search?q=ICC%20Cricket%20World%20Cup&tournament=icc-world-cup',
    icon: ShieldAlert,
    tone: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30',
  },
  {
    title: 'Player News',
    summary: 'Player form, injuries, milestones, records, and profile updates.',
    href: '/search?q=virat',
    icon: UserRound,
    tone: 'text-green-600 bg-green-50 dark:bg-green-950/30',
  },
  {
    title: 'Breaking News',
    summary: 'Fast access to active cricket alerts, schedule changes, and headline updates.',
    href: 'https://www.icc-cricket.com/news/index',
    icon: Bell,
    tone: 'text-red-600 bg-red-50 dark:bg-red-950/30',
  },
];

export default function NewsPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 rounded-2xl bg-[#10233f] p-8 text-white shadow-xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-blue-100">
            <Newspaper size={15} className="text-orange-400" /> Cricket Newsroom
          </div>
          <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight md:text-5xl">
            Latest Cricket News
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100 md:text-base">
            Follow IPL, WPL, ICC events, player stories, breaking headlines, upcoming series, and match context from one cricket desk.
          </p>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          {categories.map((category) => (
            <Link
              key={category.title}
              href={category.href}
              className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
            >
              <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${category.tone}`}>
                <category.icon size={20} />
              </div>
              <h2 className="text-base font-black text-gray-900 group-hover:text-orange-600 dark:text-white">
                {category.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-gray-500">{category.summary}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-xs font-black uppercase tracking-widest text-blue-600">
                Open <ArrowUpRight size={13} />
              </span>
            </Link>
          ))}
        </section>

        <div className="space-y-8">
          <LatestCricketNews />
          <UpcomingSeries />
        </div>
      </div>
    </main>
  );
}
