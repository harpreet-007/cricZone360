'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Menu, X, ChevronDown } from 'lucide-react';
import GoogleTranslate from './GoogleTranslate';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Search', href: '/search' },
    { name: 'Live Scores', href: '/live-scores' },
    { name: 'Latest News', href: '/news' },
  ];

  const moreLinks = [
    { name: 'Upcoming Matches', href: '/live-scores#upcoming-matches' },
    { name: 'Recent Results', href: '/live-scores#recent-results' },
  ];

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <nav className="bg-[#1a365d] text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center group">
              <span className="text-2xl font-black italic tracking-tighter group-hover:scale-105 transition-transform">
                CRICZONE<span className="text-orange-500">360</span>
              </span>
            </Link>
            <div className="hidden xl:block">
              <div className="ml-10 flex items-center space-x-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="hover:bg-blue-800 px-3 py-2 rounded-md text-[13px] font-bold transition-all hover:text-orange-400"
                  >
                    {link.name}
                  </Link>
                ))}
                
                {/* More Dropdown */}
                <div className="relative group/more">
                  <button className="flex items-center gap-1 hover:bg-blue-800 px-3 py-2 rounded-md text-[13px] font-bold transition-all">
                    More <ChevronDown size={14} className="group-hover/more:rotate-180 transition-transform" />
                  </button>
                  <div className="absolute left-0 mt-0 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-2xl py-2 invisible group-hover/more:visible opacity-0 group-hover/more:opacity-100 transition-all border border-gray-100 dark:border-gray-800">
                    {moreLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        className="block px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600"
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <form onSubmit={submitSearch} className="hidden lg:block flex-1 max-w-xs xl:max-w-md ml-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search players, matches, teams..."
                className="w-full bg-blue-900/50 border border-blue-700 rounded-full py-1 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1.5 h-4 w-4 text-gray-400" />
            </div>
          </form>
          <div className="hidden lg:block ml-4">
            <GoogleTranslate />
          </div>
          <div className="hidden md:block ml-3">
            <ThemeToggle />
          </div>
          <div className="md:hidden flex items-center">
            <ThemeToggle />
            <button onClick={() => setIsOpen(!isOpen)} className="p-2">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-blue-900 px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium">Home</Link>
          <Link href="/search" className="block px-3 py-2 rounded-md text-base font-medium">Search</Link>
          <Link href="/live-scores" className="block px-3 py-2 rounded-md text-base font-medium">Live Scores</Link>
          <Link href="/news" className="block px-3 py-2 rounded-md text-base font-medium">Latest News</Link>
          <Link href="/live-scores#upcoming-matches" className="block px-3 py-2 rounded-md text-base font-medium">Upcoming Matches</Link>
          <Link href="/live-scores#recent-results" className="block px-3 py-2 rounded-md text-base font-medium">Recent Results</Link>
          <div className="px-3 py-2">
            <GoogleTranslate />
          </div>
          <form onSubmit={submitSearch} className="px-3 py-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-blue-800 border border-blue-700 rounded-full py-1 px-4 pl-10 focus:outline-none text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1.5 h-4 w-4 text-gray-400" />
            </div>
          </form>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
