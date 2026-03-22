"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [newsletterData, setNewsletterData] = useState({ name: '', email: '' });
  const [subscribed, setSubscribed] = useState(false);

  // This calculates the exact time until April 1, 2026 @ 12:00 PM
  useEffect(() => {
    const targetDate = new Date('2026-04-01T12:00:00').getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newsletterData),
      });
      if (response.ok) setSubscribed(true);
    } catch (error) {
      console.error("Newsletter signup failed:", error);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center p-8 py-20">
      <div className="w-full max-w-4xl mx-auto text-center">
        
        <div className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-sm font-medium tracking-wide">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          System Launching Soon
        </div>

        <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight text-white mb-6">
          Cronan AI
        </h1>
        <p className="text-xl md:text-2xl text-slate-400 mb-16 max-w-2xl mx-auto">
          High-level data specialist services and premier AI trainer recruitment.
        </p>

        {/* THE COUNTDOWN CLOCK */}
        <div className="flex justify-center gap-4 md:gap-8 mb-16">
          {Object.entries(timeLeft).map(([unit, value]) => (
            <div key={unit} className="flex flex-col items-center">
              <div className="w-20 h-20 md:w-32 md:h-32 flex items-center justify-center bg-slate-900/80 border border-slate-800 rounded-2xl shadow-[0_0_30px_rgba(34,211,238,0.1)] text-4xl md:text-6xl font-bold text-cyan-400 font-mono">
                {value.toString().padStart(2, '0')}
              </div>
              <span className="uppercase tracking-widest text-xs md:text-sm text-slate-500 mt-4 font-semibold">
                {unit}
              </span>
            </div>
          ))}
        </div>

        {/* FULL APPLICATION BUTTONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-24">
          <Link href="/agency" className="block w-full">
            <button className="w-full px-6 py-4 bg-slate-800 text-cyan-400 border border-cyan-500/30 font-bold text-lg rounded-xl transition-all duration-300 hover:bg-cyan-500 hover:text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
              Join Trainer Waitlist
            </button>
          </Link>
          <Link href="/b2b" className="block w-full">
            <button className="w-full px-6 py-4 bg-slate-800 text-amber-500 border border-amber-500/30 font-bold text-lg rounded-xl transition-all duration-300 hover:bg-amber-500 hover:text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              Business Early Access
            </button>
          </Link>
        </div>

        {/* QUICK NEWSLETTER SIGNUP */}
        <div className="max-w-md mx-auto bg-slate-900/50 p-8 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-xl">
          <h3 className="text-xl font-bold text-white mb-2">Stay Updated</h3>
          <p className="text-sm text-slate-400 mb-6">Not ready to apply? Get notified when we officially launch.</p>
          
          {subscribed ? (
            <div className="p-4 bg-emerald-900/30 border border-emerald-800/50 rounded-lg text-emerald-400 font-medium">
              You're on the list! Keep an eye on your inbox.
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="space-y-4">
              <input 
                required 
                type="text" 
                placeholder="First Name" 
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-400 text-white"
                value={newsletterData.name}
                onChange={(e) => setNewsletterData({...newsletterData, name: e.target.value})}
              />
              <input 
                required 
                type="email" 
                placeholder="Email Address" 
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-400 text-white"
                value={newsletterData.email}
                onChange={(e) => setNewsletterData({...newsletterData, email: e.target.value})}
              />
              <button type="submit" className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors border border-slate-700 hover:border-slate-500">
                Subscribe
              </button>
            </form>
          )}
        </div>

      </div>
    </main>
  );
}