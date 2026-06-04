'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getSearchMetadata, searchEverything } from '@/lib/api';
import { logClientWarning } from '@/lib/clientError';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { AlertTriangle, Trophy, MapPin, ChevronRight, Database, CalendarDays, Filter, Search, Sparkles, User } from 'lucide-react';

const tournamentOptions = [
  { value: 'ipl', label: 'IPL', query: 'IPL', summaryKey: 'ipl', aliases: ['ipl'] },
  { value: 'icc-world-cup', label: 'ICC Cricket World Cup', query: 'ICC Cricket World Cup', summaryKey: 'icc world cup', aliases: ['icc cricket world cup', 'icc world cup', 'cricket world cup'] },
  { value: 'the-ashes', label: 'The Ashes', query: 'The Ashes', summaryKey: 'the ashes', aliases: ['the ashes', 'ashes'] },
  { value: 'wpl', label: 'WPL', query: 'WPL', summaryKey: 'wpl', aliases: ['wpl', "women's premier league", 'women premier league'] },
  { value: 'u19-womens-world-cup', label: 'ICC Women\'s U19 T20 World Cup', query: 'ICC Women U19 T20 World Cup', summaryKey: 'icc women u19 t20 world cup', aliases: ['icc women u19 t20 world cup', "icc women's u19 t20 world cup", 'u19 women world cup', 'u19 womens world cup'] },
  { value: 'u19-world-cup', label: 'ICC U19 Cricket World Cup', query: 'ICC U19 Cricket World Cup', summaryKey: 'u19 world cup', aliases: ['icc u19 cricket world cup', 'u19 cricket world cup', 'u19 world cup'] },
];
const queryTerms = (value?: string | null) => String(value || '').trim().split(/\s+/).filter(Boolean);
type TournamentMetadata = {
  key: string;
  label: string;
  query: string;
  earliestYear: string | null;
  latestYear: string | null;
  years: string[];
  seasons: Array<{ year: string; totalMatches: number | string; winner: string }>;
};

const tournamentSummaries: Record<string, { label: string; rows: Record<string, { totalMatches: number | string; winner: string }> }> = {
  ipl: {
    label: 'IPL',
    rows: {
      '2026': { totalMatches: 74, winner: 'Royal Challengers Bengaluru' },
      '2025': { totalMatches: 74, winner: 'Royal Challengers Bengaluru' },
      '2024': { totalMatches: 74, winner: 'Kolkata Knight Riders' },
      '2023': { totalMatches: 74, winner: 'Chennai Super Kings' },
      '2022': { totalMatches: 74, winner: 'Gujarat Titans' },
      '2021': { totalMatches: 60, winner: 'Chennai Super Kings' },
      '2020': { totalMatches: 60, winner: 'Mumbai Indians' },
      '2019': { totalMatches: 60, winner: 'Mumbai Indians' },
      '2018': { totalMatches: 60, winner: 'Chennai Super Kings' },
      '2017': { totalMatches: 60, winner: 'Mumbai Indians' },
      '2016': { totalMatches: 60, winner: 'Sunrisers Hyderabad' },
      '2015': { totalMatches: 60, winner: 'Mumbai Indians' },
      '2014': { totalMatches: 60, winner: 'Kolkata Knight Riders' },
      '2013': { totalMatches: 76, winner: 'Mumbai Indians' },
      '2012': { totalMatches: 76, winner: 'Kolkata Knight Riders' },
      '2011': { totalMatches: 74, winner: 'Chennai Super Kings' },
      '2010': { totalMatches: 60, winner: 'Chennai Super Kings' },
      '2009': { totalMatches: 59, winner: 'Deccan Chargers' },
      '2008': { totalMatches: 59, winner: 'Rajasthan Royals' },
    },
  },
  'icc world cup': {
    label: 'ICC Cricket World Cup',
    rows: {
      '2027': { totalMatches: 54, winner: 'TBA' },
      '2023': { totalMatches: 48, winner: 'Australia' },
      '2019': { totalMatches: 48, winner: 'England' },
      '2015': { totalMatches: 49, winner: 'Australia' },
      '2011': { totalMatches: 49, winner: 'India' },
      '2007': { totalMatches: 51, winner: 'Australia' },
      '2003': { totalMatches: 54, winner: 'Australia' },
      '1999': { totalMatches: 42, winner: 'Australia' },
      '1996': { totalMatches: 37, winner: 'Sri Lanka' },
      '1992': { totalMatches: 39, winner: 'Pakistan' },
      '1987': { totalMatches: 27, winner: 'Australia' },
      '1983': { totalMatches: 27, winner: 'India' },
      '1979': { totalMatches: 15, winner: 'West Indies' },
      '1975': { totalMatches: 15, winner: 'West Indies' },
    },
  },
  'the ashes': {
    label: 'The Ashes',
    rows: {
      '2023': { totalMatches: 5, winner: 'Series drawn 2-2; Australia retained' },
      '2021': { totalMatches: 5, winner: 'Australia' },
      '2019': { totalMatches: 5, winner: 'Series drawn 2-2; Australia retained' },
      '2017': { totalMatches: 5, winner: 'Australia' },
      '2015': { totalMatches: 5, winner: 'England' },
    },
  },
  wpl: {
    label: 'WPL',
    rows: {
      '2026': { totalMatches: 22, winner: 'Royal Challengers Bengaluru Women' },
      '2025': { totalMatches: 22, winner: 'Mumbai Indians Women' },
      '2024': { totalMatches: 22, winner: 'Royal Challengers Bengaluru Women' },
      '2023': { totalMatches: 22, winner: 'Mumbai Indians Women' },
    },
  },
  'icc women u19 t20 world cup': {
    label: 'ICC Women\'s U19 T20 World Cup',
    rows: {
      '2025': { totalMatches: 41, winner: 'India U19' },
    },
  },
  'u19 world cup': {
    label: 'ICC U19 Cricket World Cup',
    rows: {
      '2026': { totalMatches: 41, winner: 'TBA' },
      '2024': { totalMatches: 41, winner: 'Australia U19' },
      '2022': { totalMatches: 48, winner: 'India U19' },
      '2020': { totalMatches: 48, winner: 'Bangladesh U19' },
      '2018': { totalMatches: 48, winner: 'India U19' },
      '2016': { totalMatches: 48, winner: 'West Indies U19' },
    },
  },
};
const searchPageCss = `
  .cz-search-page {
    max-width: 1280px;
    margin: 0 auto;
    padding: 32px 16px;
  }
  .cz-shell {
    display: grid;
    gap: 24px;
  }
  .cz-hero {
    overflow: hidden;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: #ffffff;
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
  }
  .cz-hero-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 340px;
  }
  .cz-hero-main {
    padding: 32px;
  }
  .cz-refine {
    border-left: 1px solid #f1f5f9;
    background: #f8fafc;
    padding: 24px;
  }
  .cz-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border-radius: 999px;
    background: #fff7ed;
    color: #ea580c;
    padding: 6px 12px;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: .08em;
    text-transform: uppercase;
  }
  .cz-title {
    margin: 16px 0 0;
    color: #0f172a;
    font-size: clamp(32px, 4vw, 44px);
    line-height: 1.05;
    font-weight: 950;
    letter-spacing: 0;
  }
  .cz-copy {
    margin-top: 14px;
    max-width: 680px;
    color: #475569;
    font-size: 14px;
    line-height: 1.7;
  }
  .cz-filter-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 24px;
  }
  .cz-filter {
    border-radius: 10px;
    background: #f1f5f9;
    color: #475569;
    padding: 10px 14px;
    font-size: 12px;
    font-weight: 900;
    letter-spacing: .06em;
    text-decoration: none;
    text-transform: uppercase;
  }
  .cz-filter-active {
    background: #1a365d;
    color: #ffffff;
  }
  .cz-refine-title,
  .cz-label,
  .cz-stat-label {
    font-size: 11px;
    font-weight: 900;
    letter-spacing: .08em;
    text-transform: uppercase;
  }
  .cz-refine-title {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #64748b;
    margin-bottom: 18px;
  }
  .cz-label {
    color: #94a3b8;
  }
  .cz-select {
    width: 100%;
    margin-top: 8px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    background: #ffffff;
    padding: 12px;
    color: #1f2937;
    font-size: 14px;
    font-weight: 800;
  }
  .cz-stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    margin-top: 20px;
  }
  .cz-stat {
    border: 1px solid #f1f5f9;
    border-radius: 10px;
    background: #ffffff;
    padding: 12px;
    text-align: center;
  }
  .cz-stat-value {
    margin: 0;
    font-size: 24px;
    font-weight: 950;
  }
  .cz-stat-label {
    margin: 4px 0 0;
    color: #94a3b8;
  }
  .cz-season-note {
    margin-top: 12px;
    color: #64748b;
    font-size: 12px;
    line-height: 1.5;
  }
  .cz-section {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: #ffffff;
    padding: 24px;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.045);
  }
  .cz-section-head {
    margin-bottom: 20px;
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: 16px;
  }
  .cz-section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    color: #111827;
    font-size: 20px;
    font-weight: 950;
  }
  .cz-section-subtitle {
    margin: 6px 0 0;
    color: #64748b;
    font-size: 14px;
  }
  .cz-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }
  .cz-grid-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .cz-card {
    display: flex;
    min-height: 176px;
    flex-direction: column;
    border: 1px solid #f1f5f9;
    border-radius: 12px;
    background: #f8fafc;
    padding: 20px;
    color: inherit;
    text-decoration: none;
  }
  .cz-card:hover {
    border-color: #bbf7d0;
    background: #f0fdf4;
  }
  .cz-card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
  }
  .cz-badge {
    border-radius: 9px;
    background: #ffffff;
    color: #64748b;
    padding: 6px 10px;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: .08em;
    text-transform: uppercase;
  }
  .cz-badge-blue {
    background: #eff6ff;
    color: #1d4ed8;
  }
  .cz-card-title {
    margin: 0;
    color: #111827;
    font-size: 19px;
    line-height: 1.25;
    font-weight: 950;
  }
  .cz-meta {
    margin-top: auto;
    padding-top: 20px;
    color: #64748b;
    font-size: 12px;
    font-weight: 800;
  }
  .cz-meta div {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
  }
  .cz-card-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    border-top: 1px solid #e5e7eb;
    margin-top: 16px;
    padding-top: 14px;
    color: #64748b;
    font-size: 12px;
    font-weight: 800;
  }
  .cz-player-card {
    min-height: auto;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  .cz-avatar {
    display: flex;
    width: 44px;
    height: 44px;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    background: #dbeafe;
    color: #1d4ed8;
    font-weight: 950;
  }
  .cz-empty {
    border: 1px dashed #cbd5e1;
    border-radius: 12px;
    background: #f8fafc;
    padding: 32px;
    color: #64748b;
    font-size: 14px;
    font-weight: 800;
    text-align: center;
  }
  .cz-alert {
    border: 1px solid #fde68a;
    border-radius: 12px;
    background: #fffbeb;
    color: #92400e;
    padding: 16px;
  }
  @media (max-width: 900px) {
    .cz-hero-grid,
    .cz-grid,
    .cz-grid-3 {
      grid-template-columns: 1fr;
    }
    .cz-refine {
      border-left: 0;
      border-top: 1px solid #f1f5f9;
    }
  }
`;

const formatDate = (value?: string) => {
  if (!value) return 'Date unavailable';
  const date = new Date(value.includes('T') ? value : `${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const ResultSection = ({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <section className="cz-section rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
    <div className="cz-section-head mb-5 flex items-start justify-between gap-4 border-b border-gray-100 pb-4 dark:border-gray-800">
      <div>
        <h2 className="cz-section-title flex items-center gap-2 text-lg font-black text-gray-900 dark:text-white">
          {icon} {title}
        </h2>
        <p className="cz-section-subtitle mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
      </div>
    </div>
    {children}
  </section>
);

const EmptyState = ({ text }: { text: string }) => (
  <div className="cz-empty rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm font-bold text-gray-500 dark:border-gray-800 dark:bg-gray-950/40 dark:text-gray-400">
    {text}
  </div>
);

const SearchResultsContent = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const year = searchParams.get('year') || '';
  const tournamentParam = searchParams.get('tournament') || '';
  const normalizedQuery = String(query || '').toLowerCase().replace(/\+/g, ' ').replace(/\s+/g, ' ').trim();
  const selectedTournamentOption =
    tournamentOptions.find((option) => option.value === tournamentParam) ||
    tournamentOptions.find((option) => option.aliases.some((alias) => normalizedQuery.includes(alias))) ||
    tournamentOptions[0];
  const [results, setResults] = useState<any>(null);
  const [metadata, setMetadata] = useState<TournamentMetadata[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const data = await getSearchMetadata();
        setMetadata(Array.isArray(data) ? data : []);
      } catch (error) {
        logClientWarning('Search metadata error', error);
      }
    };

    fetchMetadata();
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      setLoading(true);
      try {
        const data = await searchEverything(query, year, tournamentParam || undefined);
        setResults(data);
        setLoading(false);
      } catch (error) {
        logClientWarning('Search error', error);
        setLoading(false);
      }
    };
    fetchResults();
  }, [query, year, tournamentParam]);

  useEffect(() => {
    const selected = metadata.find((item) => item.key === selectedTournamentOption.value);
    if (!selected || !year || selected.years.includes(year)) return;

    const params = new URLSearchParams();
    params.set('q', selectedTournamentOption.query);
    params.set('tournament', selectedTournamentOption.value);
    window.location.href = `/search?${params.toString()}`;
  }, [metadata, selectedTournamentOption.query, selectedTournamentOption.value, year]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">Searching</p>
              <h1 className="mt-1 text-2xl font-black text-gray-900 dark:text-white">Finding cricket data for "{query}"</h1>
            </div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-36 animate-pulse rounded-lg bg-white shadow-sm dark:bg-gray-900" />
          ))}
        </div>
      </div>
    );
  }

  if (!query) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-10 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <Search className="mx-auto mb-4 text-orange-500" size={34} />
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Start with a cricket search</h1>
        <p className="mt-2 text-sm text-gray-500">Search tournaments, teams, players, venues, or matches.</p>
      </div>
    );
  }

  const hasResults = Boolean(
    results?.players?.length ||
    results?.matches?.length ||
    results?.series?.length
  );

  const selectedTournament = tournamentSummaries[selectedTournamentOption.summaryKey];
  const selectedMetadata = metadata.find((item) => item.key === selectedTournamentOption.value);
  const metadataRows = selectedMetadata?.seasons?.reduce((rows, season) => {
    rows[season.year] = {
      totalMatches: season.totalMatches,
      winner: season.winner,
    };
    return rows;
  }, {} as Record<string, { totalMatches: number | string; winner: string }>);
  const availableRows = metadataRows && Object.keys(metadataRows).length > 0 ? metadataRows : selectedTournament.rows;
  const yearOptions = (selectedMetadata?.years?.length ? selectedMetadata.years : Object.keys(availableRows))
    .slice()
    .sort((a, b) => Number(a) - Number(b));
  const selectedSeasonSummary = year ? availableRows[year] : null;
  const allYearsTotal = Object.values(availableRows).reduce((total, row) => (
    typeof row.totalMatches === 'number' ? total + row.totalMatches : total
  ), 0);
  const totalMatchesForYear = selectedSeasonSummary?.totalMatches ?? (year ? results?.matches?.length || 0 : 0);
  const winnerForYear = selectedSeasonSummary?.winner || 'Winner unavailable';
  const isPlayerSearch = (results?.players?.length || 0) > 0 && queryTerms(query).length >= 2;
  const goToTournamentYear = (tournamentValue: string, nextYear: string) => {
    const selected = tournamentOptions.find((option) => option.value === tournamentValue) || selectedTournamentOption;
    const params = new URLSearchParams();
    params.set('q', selected.query);
    params.set('tournament', selected.value);
    if (nextYear) params.set('year', nextYear);
    window.location.href = `/search?${params.toString()}`;
  };

  return (
    <div className="cz-shell space-y-6">
      <style dangerouslySetInnerHTML={{ __html: searchPageCss }} />
      <section className="cz-hero overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="cz-hero-grid grid gap-0 lg:grid-cols-[1fr_340px]">
          <div className="cz-hero-main p-6 sm:p-8">
            <div className="cz-pill mb-4 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-orange-600 dark:bg-orange-900/20">
              <Sparkles size={13} /> Cricket Search
            </div>
            <h1 className="cz-title text-3xl font-black tracking-tight text-gray-950 dark:text-white sm:text-4xl">
              🏏 Discover the World of Cricket
            </h1>
            <p className="cz-copy mt-3 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-400">
              {isPlayerSearch
                ? 'Browse players, matches, tournaments, records, and cricket history.'
                : 'Search players, matches, tournaments, records, and cricket history.'}
            </p>

            <div className="cz-filter-row mt-6 flex flex-wrap gap-2">
              {tournamentOptions.map((filter) => (
                <Link
                  key={filter.value}
                  href={`/search?q=${encodeURIComponent(filter.query)}&tournament=${filter.value}${year ? `&year=${year}` : ''}`}
                  className={`cz-filter rounded-lg px-4 py-2 text-xs font-black uppercase tracking-widest transition-colors ${
                    selectedTournamentOption.value === filter.value
                      ? 'cz-filter-active bg-[#1a365d] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-orange-900/20'
                  }`}
                >
                  {filter.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="cz-refine border-t border-gray-100 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-950/50 lg:border-l lg:border-t-0">
            <div className="cz-refine-title mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500">
              <Filter size={14} className="text-orange-500" /> Refine Results
            </div>
            <label className="cz-label block text-xs font-black uppercase tracking-widest text-gray-400">Tournament</label>
            <select
              value={selectedTournamentOption.value}
              onChange={(event) => goToTournamentYear(event.target.value, year)}
              className="cz-select mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm font-bold text-gray-800 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:ring-orange-900/30"
            >
              {tournamentOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>

            <label className="cz-label mt-5 block text-xs font-black uppercase tracking-widest text-gray-400">Year</label>
            <select
              value={year}
              onChange={(event) => goToTournamentYear(selectedTournamentOption.value, event.target.value)}
              className="cz-select mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm font-bold text-gray-800 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:ring-orange-900/30"
            >
              <option value="">All years</option>
              {yearOptions.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>

            {year ? (
              <>
                <div className="cz-stats mt-5 grid grid-cols-2 gap-2">
                  <div className="cz-stat rounded-lg bg-white p-3 text-center ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
                    <p className="cz-stat-value text-xl font-black text-green-600">{totalMatchesForYear}</p>
                    <p className="cz-stat-label mt-1 text-[10px] font-black uppercase tracking-widest text-gray-400">Total Matches</p>
                  </div>
                  <div className="cz-stat rounded-lg bg-white p-3 text-center ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
                    <p className="cz-stat-value text-base font-black text-orange-600">{winnerForYear}</p>
                    <p className="cz-stat-label mt-1 text-[10px] font-black uppercase tracking-widest text-gray-400">Winner Team</p>
                  </div>
                </div>
                <p className="cz-season-note">
                  {selectedTournament.label} summary for {year}. Select a different year to update total matches and winner team.
                </p>
              </>
            ) : (
              <>
                <div className="cz-stats mt-5 grid grid-cols-1 gap-2">
                  <div className="cz-stat rounded-lg bg-white p-3 text-center ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
                    <p className="cz-stat-value text-xl font-black text-green-600">{allYearsTotal}</p>
                    <p className="cz-stat-label mt-1 text-[10px] font-black uppercase tracking-widest text-gray-400">Total History Matches</p>
                  </div>
                </div>
                <p className="cz-season-note">
                  Showing all available {selectedTournament.label} match schedule and result records. Select a year to show winner team.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {results?.info && !hasResults && (
        <div className="cz-alert rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">Live cricket provider did not return data for this search.</p>
              <p className="mt-1 text-sm">
                {[results.info.matches?.reason, results.info.players?.reason, results.info.series?.reason]
                  .filter(Boolean)
                  .filter((reason: string, index: number, list: string[]) => list.indexOf(reason) === index)
                  .join(' | ') || 'No provider reason was supplied.'}
              </p>
            </div>
          </div>
        </div>
      )}
      <ResultSection
        title="Players"
        subtitle="Profiles and player records matching this search"
        icon={<User size={20} className="text-blue-600" />}
      >
        {results?.players?.length > 0 ? (
          <div className="cz-grid grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.players.map((player: any) => (
              <Link
                href={`/player?id=${encodeURIComponent(player.id)}`}
                key={player.id || player.name}
                className="cz-card group flex items-center gap-4 rounded-lg border border-gray-100 bg-gray-50 p-5 transition-all hover:border-blue-200 hover:bg-blue-50 dark:border-gray-800 dark:bg-gray-950/40 dark:hover:border-blue-900 dark:hover:bg-blue-900/10"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                  <User size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-lg font-black text-gray-900 group-hover:text-blue-700 dark:text-white">
                    {player.name}
                  </h3>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wider text-gray-500">
                    {player.role || player.country || 'Player profile'}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-blue-600">
                    Open complete profile
                  </p>
                </div>
                <ChevronRight size={16} className="shrink-0 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-600" />
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState text={`No players found matching "${query}".`} />
        )}
      </ResultSection>

      <ResultSection
        title="Series & Tournaments"
        subtitle="Competitions, seasons, and archive categories"
        icon={<Database size={20} className="text-orange-600" />}
      >
        {results?.series?.length > 0 ? (
          <div className="cz-grid grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.series.map((series: any) => (
              <div key={series.id || series.name} className="cz-card rounded-lg border border-gray-100 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-950/40">
                <div className="cz-card-top mb-4 flex items-start justify-between gap-3">
                  <div>
                    <span className="cz-card-title block text-base font-black text-gray-900 dark:text-white">{series.name}</span>
                    <span className="mt-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
                      {[series.startDate, series.endDate].filter(Boolean).join(' to ') || 'Dates unavailable'}
                    </span>
                  </div>
                  <Trophy size={18} className="shrink-0 text-orange-500" />
                </div>
                <span className="cz-badge inline-flex rounded-lg bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-gray-500 ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
                  {series.odi ? `${series.odi} ODI` : series.t20 ? `${series.t20} T20` : series.matches ? `${series.matches} matches` : 'Tournament'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState text={`No series found matching "${query}".`} />
        )}
      </ResultSection>

      <ResultSection
        title="Matches"
        subtitle="Fixtures, scorecards, venues, and match result records"
        icon={<Trophy size={20} className="text-green-600" />}
      >
        {results?.matches?.length > 0 ? (
          <div className="cz-grid grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.matches.map((match: any) => (
              <Link
                href={`/match?id=${encodeURIComponent(match.id)}`}
                key={match.id}
                className="cz-card group flex min-h-48 flex-col rounded-lg border border-gray-100 bg-gray-50 p-5 transition-all hover:border-green-200 hover:bg-green-50 dark:border-gray-800 dark:bg-gray-950/40 dark:hover:border-green-900 dark:hover:bg-green-900/10"
              >
                <div className="cz-card-top mb-4 flex items-start justify-between gap-3">
                  <span className="cz-badge max-w-[60%] rounded-lg bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-gray-500 ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
                    {match.series || 'Cricket'}
                  </span>
                  <span className="cz-badge cz-badge-blue rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-blue-700 dark:bg-blue-900/30 dark:text-blue-200">
                    {match.matchEnded ? 'Result' : match.matchStarted ? 'Live' : 'Fixture'}
                  </span>
                </div>

                <h3 className="cz-card-title text-lg font-black leading-snug text-gray-900 transition-colors group-hover:text-green-700 dark:text-white">
                  {match.name}
                </h3>

                <div className="cz-meta mt-auto space-y-2 pt-5 text-xs font-bold text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="text-orange-500" /> {match.venue || 'Venue unavailable'}
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays size={13} className="text-blue-500" /> {formatDate(match.date)}
                  </div>
                </div>

                <div className="cz-card-foot mt-4 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-800">
                  <span className="line-clamp-1 text-xs font-bold text-gray-500 dark:text-gray-400">{match.status || 'Status unavailable'}</span>
                  <ChevronRight size={16} className="shrink-0 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-green-600" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState text={year ? 'No matches found for the selected tournament and year.' : `No matches found matching "${query}".`} />
        )}
      </ResultSection>
    </div>
  );
};

const SearchResults = () => {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<div className="p-8 text-center">Loading search...</div>}>
          <SearchResultsContent />
        </Suspense>
      </div>
    </main>
  );
};

export default SearchResults;
