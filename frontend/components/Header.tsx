"use client";
import React, { useState } from 'react';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: '/', label: 'Home', color: 'hover:text-cyan-400' },
    { href: '/guidelines', label: 'Guidelines', color: 'hover:text-cyan-400' },
    { href: '/agency', label: 'Join Roster', color: 'hover:text-cyan-400' },
    { href: '/b2b', label: 'Enterprise', color: 'hover:text-amber-500' },
    { href: '/investors', label: 'Investors', color: 'hover:text-amber-500' },
  ];

  return (
    <header className="w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
        <div className="text-xl font-extrabold tracking-tight text-white">
          Cronan AI<span className="text-cyan-400">®</span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-400">
          {links.map(({ href, label, color }) => (
            <a key={href} href={href} className={`${color} transition-colors`}>{label}</a>
          ))}
        </nav>

        {/* Mobile hamburger button */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2 text-slate-400 hover:text-white transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span className={`block w-6 h-0.5 bg-current transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-current transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-current transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <nav className="md:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-md px-8 py-4 flex flex-col gap-4 text-sm font-medium text-slate-400">
          {links.map(({ href, label, color }) => (
            <a
              key={href}
              href={href}
              className={`${color} transition-colors py-1`}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
