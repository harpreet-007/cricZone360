import Navbar from '@/components/Navbar';
import LiveScores from '@/components/LiveScores';
import GlobalSearch from '@/components/GlobalSearch';
import UpcomingMatches from '@/components/UpcomingMatches';
import RecentResults from '@/components/RecentResults';
import LatestCricketNews from '@/components/LatestCricketNews';
import CricketHistoryPreview from '@/components/CricketHistoryPreview';
import UpcomingSeries from '@/components/UpcomingSeries';
import { TournamentSections, TrendingFromLive } from '@/components/ApiDrivenPanels';
import { Activity, BarChart3, ChevronRight, Database, MapPin, ShieldCheck, Trophy, Zap } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      <Navbar />
      <TrendingFromLive />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="mb-12 border-b border-gray-200 pb-10 dark:border-gray-800">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-[#1a365d] shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:text-blue-100 dark:ring-gray-800">
                <Activity size={14} className="text-red-500" /> Live cricket operations desk
              </div>
              <h1 className="max-w-4xl text-4xl font-black tracking-tight text-[#10233f] dark:text-white md:text-6xl">
                Scores, schedules, players, and scorecards in one professional cricket workspace.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600 dark:text-gray-400 md:text-lg">
                CricZone 360 is built like a real data product: backend API routes, provider integration, real-time socket updates, search, match detail pages, and reliable demo data when live credentials are unavailable.
              </p>
              <div className="mt-7 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { label: 'Live API', value: 'Connected', icon: Zap },
                  { label: 'Coverage', value: 'Men, Women, U19', icon: Trophy },
                  { label: 'Data Model', value: 'Matches + Players', icon: Database },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
                    <item.icon size={18} className="mb-3 text-orange-500" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{item.label}</p>
                    <p className="mt-1 text-sm font-extrabold text-gray-900 dark:text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg bg-[#10233f] p-5 text-white shadow-xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">Control room</p>
                  <h2 className="text-xl font-black">Match intelligence</h2>
                </div>
                <BarChart3 className="text-orange-400" />
              </div>
              <div className="space-y-3">
                {[
                  ['Live score refresh', 'Socket updates every 30 seconds'],
                  ['Provider fallback', 'Demo data when keys or quota fail'],
                  ['Search pipeline', 'Players, series, venues, matches'],
                  ['Production routes', 'Express API behind Next.js UI'],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between rounded-lg bg-white/10 p-3">
                    <span className="text-sm font-bold">{label}</span>
                    <span className="max-w-[45%] text-right text-xs text-blue-100">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-8">
            <GlobalSearch />
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-12">
            <section id="live-scores">
              <LiveScores />
            </section>

            <TournamentSections />
            <section id="upcoming-series">
              <UpcomingSeries />
            </section>
            <UpcomingMatches />
            <section id="latest-news">
              <LatestCricketNews />
            </section>
            <CricketHistoryPreview />
            <section id="recent-results" className="scroll-mt-24">
              <RecentResults />
            </section>
          </div>

          <aside className="space-y-8">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
              <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <Trophy size={14} className="text-orange-500" /> Rankings Data
              </div>
              <div className="p-6 text-sm text-gray-600 dark:text-gray-400">
                <Database className="text-blue-600 mb-4" size={28} />
                <p className="font-bold text-gray-900 dark:text-white mb-2">Official endpoint required</p>
                <p>The platform does not show fabricated ICC rankings. Add the SportRadar/RapidAPI ranking route once its credentials and contract are available.</p>
              </div>
            </div>

            <div id="series-search" className="scroll-mt-24 bg-[#1a365d] rounded-2xl p-6 text-white shadow-xl">
              <h3 className="font-black text-xs uppercase tracking-widest text-blue-300 mb-6 flex items-center gap-2">
                <Zap size={14} className="text-orange-500" /> Series Search
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'IPL', href: '/search?q=IPL' },
                  { name: 'ICC World Cup', href: '/search?q=ICC%20World%20Cup' },
                  { name: 'The Ashes', href: '/search?q=The%20Ashes' },
                  { name: 'WPL', href: '/search?q=WPL' },
                  { name: 'U19 World Cup', href: '/search?q=U19%20World%20Cup' },
                ].map((series) => (
                  <Link
                    key={series.name}
                    href={series.href}
                    className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all group"
                  >
                    <span className="text-sm font-bold text-blue-50">{series.name}</span>
                    <ChevronRight size={14} className="text-blue-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="font-black text-lg mb-2 italic">STADIUM ANALYTICS</h3>
                <p className="text-xs text-orange-100 mb-4 font-medium">Search venues from API match archives. Pitch reports and venue aggregates need a connected stadium stats endpoint.</p>
                <Link href="/search?q=stadium" className="inline-block bg-white text-orange-600 text-[10px] font-black px-4 py-2 rounded-lg uppercase tracking-widest shadow-lg group-hover:scale-105 transition-transform">
                  Search Venues
                </Link>
              </div>
              <MapPin className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10 group-hover:scale-110 transition-transform duration-500" />
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6">
              <h3 className="font-black text-xs uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
                <ShieldCheck size={14} className="text-green-500" /> Data Integrity
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Scores, fixtures, players, and scorecards are loaded through backend API routes. Missing provider fields are shown as unavailable instead of being guessed.
              </p>
            </div>
          </aside>
        </div>
      </div>

      <footer className="bg-[#0f172a] text-white py-16 mt-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <span className="text-3xl font-black italic tracking-tighter mb-6 block">CRICZONE<span className="text-orange-500">360</span></span>
              <p className="text-gray-400 text-sm max-w-md leading-relaxed">
                A cricket data platform wired to live providers for scores, fixtures, scorecards, players, and match archives.
              </p>
            </div>
            <div>
              <h4 className="font-black text-xs uppercase tracking-widest text-gray-500 mb-6">Cricket</h4>
              <ul className="space-y-3 text-sm font-bold text-gray-300">
                <li><Link href="/#live-scores" className="hover:text-orange-500 transition-colors">Live Scorecard</Link></li>
                <li><Link href="/search?q=rankings" className="hover:text-orange-500 transition-colors">Rankings Search</Link></li>
                <li><Link href="/search?q=player" className="hover:text-orange-500 transition-colors">Player Stats</Link></li>
                <li><Link href="/search?q=stadium" className="hover:text-orange-500 transition-colors">Venue Search</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-xs uppercase tracking-widest text-gray-500 mb-6">Categories</h4>
              <ul className="space-y-3 text-sm font-bold text-gray-300">
                <li><Link href="/search?q=IPL" className="hover:text-orange-500 transition-colors">IPL</Link></li>
                <li><Link href="/search?q=ICC" className="hover:text-orange-500 transition-colors">ICC Events</Link></li>
                <li><Link href="/search?q=Women" className="hover:text-orange-500 transition-colors">Women's Cricket</Link></li>
                <li><Link href="/search?q=U19" className="hover:text-orange-500 transition-colors">U19 Cricket</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            <p>(c) 2026 CricZone 360. All rights reserved.</p>
            <p>Data Partners: SportRadar, CricAPI, RapidAPI</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
