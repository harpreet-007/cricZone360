'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Search, X, Loader2, Trophy, User, MapPin, Calendar, Database } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { searchEverything } from '@/lib/api';
import { logClientWarning } from '@/lib/clientError';

const GlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length > 2) {
        setIsLoading(true);
        setIsOpen(true);
        try {
          const data = await searchEverything(query);
          setResults(data);
        } catch (error) {
          logClientWarning('Search error', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults(null);
        setIsOpen(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    submitSearch();
  };

  const submitSearch = () => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto mb-12" ref={dropdownRef}>
      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
          <Search className="h-6 w-6 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
        </div>
        <input
          type="text"
          className="block w-full pl-16 pr-12 py-5 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-2xl text-xl shadow-xl focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400"
          placeholder="Search IPL matches, players, teams, venues..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute inset-y-0 right-0 pr-6 flex items-center text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </form>

      {/* Quick Results Dropdown */}
      {isOpen && (results || isLoading) && (
        <div className="absolute mt-3 w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 z-[100] overflow-hidden max-h-[600px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center text-gray-500">
              <Loader2 className="h-8 w-8 animate-spin mb-4 text-orange-500" />
              <p className="font-medium">Searching our database...</p>
            </div>
          ) : (
            <div className="p-2">
              {results.players?.length > 0 && (
                <div className="mb-4">
                  <h3 className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <User size={14} /> Players
                  </h3>
                  <div className="space-y-1">
                    {results.players.map((player: any) => (
                      <button
                        key={player.id}
                        onClick={() => {
                          router.push(`/player?id=${encodeURIComponent(player.id)}`);
                          setIsOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl flex items-center gap-4 transition-colors"
                      >
                        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-orange-600">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-gray-100">{player.name}</p>
                          <p className="text-xs text-gray-500">{player.country || 'International Player'}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.matches?.length > 0 && (
                <div className="mb-4">
                  <h3 className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Trophy size={14} /> Matches
                  </h3>
                  <div className="space-y-1">
                    {results.matches.map((match: any) => (
                      <button
                        key={match.id}
                        onClick={() => {
                          router.push(`/match?id=${encodeURIComponent(match.id)}`);
                          setIsOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl flex items-center gap-4 transition-colors"
                      >
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600">
                          <Trophy size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 dark:text-gray-100 line-clamp-1">{match.name}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1"><MapPin size={12} /> {match.venue}</span>
                            <span className="flex items-center gap-1"><Calendar size={12} /> {match.date}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.series?.length > 0 && (
                <div className="mb-4">
                  <h3 className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Database size={14} /> Series & Tournaments
                  </h3>
                  <div className="space-y-1">
                    {results.series.map((series: any) => (
                      <button
                        key={series.id || series.name}
                        onClick={() => {
                          router.push(`/search?q=${encodeURIComponent(series.name || query)}`);
                          setIsOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl flex items-center gap-4 transition-colors"
                      >
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600">
                          <Database size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-gray-100">{series.name}</p>
                          <p className="text-xs text-gray-500">{[series.startDate, series.endDate].filter(Boolean).join(' to ') || 'Dates unavailable'}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(!results.players?.length && !results.matches?.length && !results.series?.length) && (
                <div className="p-12 text-center text-gray-500">
                  {results.info ? (
                    <>
                      <AlertTriangle className="mx-auto mb-3 text-amber-500" size={28} />
                      <p className="font-bold text-gray-900 dark:text-white">Provider returned no live data.</p>
                      <p className="mt-2 text-sm">
                        {[results.info.matches?.reason, results.info.players?.reason, results.info.series?.reason]
                          .filter(Boolean)
                          .filter((reason: string, index: number, list: string[]) => list.indexOf(reason) === index)
                          .join(' | ') || 'No provider reason was supplied.'}
                      </p>
                    </>
                  ) : (
                    <p className="font-medium">No direct matches found. Press Enter to see all results.</p>
                  )}
                </div>
              )}

              <button
                onClick={submitSearch}
                className="w-full mt-2 p-4 text-center text-sm font-bold text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10 border-t border-gray-100 dark:border-gray-800 transition-colors"
              >
                View all results for "{query}"
              </button>
            </div>
          )}
        </div>
      )}

      {/* Popular Search Tags */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        <span className="text-xs font-bold text-gray-400 uppercase mr-2 mt-1.5">Popular:</span>
        {['Virat Kohli', 'India vs Pakistan', 'IPL final', 'Wankhede Stadium', 'Women World Cup'].map((tag) => (
          <button
            key={tag}
            onClick={() => setQuery(tag)}
            className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-1.5 rounded-full hover:bg-orange-500 hover:text-white transition-all font-medium"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GlobalSearch;
