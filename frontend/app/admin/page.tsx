"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Staff accounts — email is the username, password set via env vars
const STAFF: Record<string, { name: string; title: string; accentColor: string; password: string }> = {
  'brianna@cronantech.com': {
    name: 'Brianna Cronan',
    title: 'Founder',
    accentColor: 'amber',
    password: process.env.NEXT_PUBLIC_BRIANNA_PASSWORD || 'brianna-admin-2026',
  },
  'bethany@cronantech.com': {
    name: 'Bethany Cronan',
    title: 'Co-Founder',
    accentColor: 'cyan',
    password: process.env.NEXT_PUBLIC_BETHANY_PASSWORD || 'bethany-admin-2026',
  },
};

interface Applicant {
  id: number; name: string; email: string; specialty: string; experience: string; status: string;
}
interface BusinessLead {
  id: number; company_name: string; contact_name: string; email: string; project_type: string; status: string;
}
interface NewsletterSubscriber {
  id: number; name: string; email: string;
}

export default function AdminDashboard() {
  const [currentUser, setCurrentUser] = useState<typeof STAFF[string] | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState<'trainers' | 'business' | 'newsletter'>('trainers');
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [leads, setLeads] = useState<BusinessLead[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const normalizedEmail = emailInput.trim().toLowerCase();
    const account = STAFF[normalizedEmail];
    if (!account) {
      setAuthError('No account found for that email.');
      return;
    }
    if (passwordInput !== account.password) {
      setAuthError('Incorrect password. Try again.');
      setPasswordInput('');
      return;
    }
    setCurrentUser(account);
    setAuthError('');
  };

  useEffect(() => {
    if (!currentUser) return;
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/applicants`).then(r => r.json()).then(setApplicants),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/b2b/leads`).then(r => r.json()).then(setLeads),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/newsletter/subscribers`).then(r => r.json()).then(setSubscribers),
    ])
      .catch(err => console.error('Error fetching data:', err))
      .finally(() => setIsLoading(false));
  }, [currentUser]);

  const handleTrainerStatus = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/applicants/${id}/status`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) setApplicants(applicants.map(a => a.id === id ? { ...a, status: newStatus } : a));
    } catch (err) { console.error(err); }
  };

  const handleLeadStatus = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/b2b/leads/${id}/status`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) setLeads(leads.map(l => l.id === id ? { ...l, status: newStatus } : l));
    } catch (err) { console.error(err); }
  };

  // --- LOGIN GATE ---
  if (!currentUser) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-widest text-slate-600 mb-2">Cronan AI</p>
            <h1 className="text-2xl font-extrabold text-white">Command Center</h1>
            <p className="text-sm text-slate-500 mt-1">Authorized personnel only.</p>
          </div>

          <form onSubmit={handleLogin} className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-8 space-y-4 shadow-xl">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</label>
              <input
                type="email"
                required
                autoFocus
                placeholder="you@cronantech.com"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                className={`w-full px-4 py-3 bg-slate-950 border rounded-lg focus:outline-none focus:border-cyan-400 text-white transition-all text-sm ${authError ? 'border-rose-500' : 'border-slate-700'}`}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                className={`w-full px-4 py-3 bg-slate-950 border rounded-lg focus:outline-none focus:border-cyan-400 text-white transition-all text-sm ${authError ? 'border-rose-500' : 'border-slate-700'}`}
              />
            </div>
            {authError && <p className="text-rose-400 text-xs">{authError}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500/50 text-white font-bold rounded-lg transition-all duration-200 mt-2"
            >
              Sign In
            </button>
          </form>

          <p className="text-center mt-6 text-xs text-slate-700">
            <Link href="/" className="hover:text-slate-500 transition-colors">← Back to The Hub</Link>
          </p>
        </div>
      </main>
    );
  }

  const isAmber = currentUser.accentColor === 'amber';

  return (
    <main className="min-h-screen p-8 text-slate-300 font-sans">
      <div className="max-w-7xl mx-auto">

        <div className="flex justify-between items-end mb-8 border-b border-slate-800 pb-6">
          <div>
            <Link href="/" className="inline-flex items-center text-sm text-cyan-400 hover:text-cyan-300 transition-colors mb-4 group">
              <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> Back to The Hub
            </Link>
            <h1 className="text-4xl font-extrabold tracking-tight text-white">
              Cronan AI <span className="text-slate-500 font-light">| Command Center</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Logged-in user badge */}
            <div className={`px-4 py-2 rounded-lg border text-sm font-semibold ${isAmber ? 'bg-amber-900/20 border-amber-800/40 text-amber-400' : 'bg-cyan-900/20 border-cyan-800/40 text-cyan-400'}`}>
              {currentUser.title}: {currentUser.name}
            </div>
            <span className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm font-semibold text-slate-400">
              {applicants.length + leads.length + subscribers.length} Records
            </span>
            <button
              onClick={() => { setCurrentUser(null); setEmailInput(''); setPasswordInput(''); }}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm font-semibold text-slate-400 hover:text-rose-400 hover:border-rose-800 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <button onClick={() => setActiveTab('trainers')}
            className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 ${activeTab === 'trainers' ? 'bg-cyan-900/40 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'bg-slate-900 text-slate-500 border border-slate-800 hover:text-slate-300'}`}>
            Trainer Roster ({applicants.length})
          </button>
          <button onClick={() => setActiveTab('business')}
            className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 ${activeTab === 'business' ? 'bg-amber-900/40 text-amber-500 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-slate-900 text-slate-500 border border-slate-800 hover:text-slate-300'}`}>
            Business Leads ({leads.length})
          </button>
          <button onClick={() => setActiveTab('newsletter')}
            className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 ${activeTab === 'newsletter' ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-500/50 shadow-[0_0_15px_rgba(52,211,153,0.2)]' : 'bg-slate-900 text-slate-500 border border-slate-800 hover:text-slate-300'}`}>
            Newsletter ({subscribers.length})
          </button>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-lg border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">

            {activeTab === 'trainers' && (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-medium">Applicant</th>
                    <th className="px-6 py-4 font-medium">Specialty</th>
                    <th className="px-6 py-4 font-medium w-1/3">Experience</th>
                    <th className="px-6 py-4 font-medium text-right">Action / Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {isLoading ? (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Loading secure database...</td></tr>
                  ) : applicants.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No applications in the queue.</td></tr>
                  ) : applicants.map(app => (
                    <tr key={`trainer-${app.id}`} className="hover:bg-slate-800/50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{app.name}</div>
                        <div className="text-xs text-cyan-400 mt-1">{app.email}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-300 capitalize">{app.specialty}</td>
                      <td className="px-6 py-4 text-slate-400 truncate max-w-xs" title={app.experience}>{app.experience}</td>
                      <td className="px-6 py-4 text-right">
                        {app.status === 'Pending Review' ? (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleTrainerStatus(app.id, 'Approved')} className="px-3 py-1 bg-emerald-900/30 text-emerald-400 border border-emerald-800/50 rounded hover:bg-emerald-800/50">Approve</button>
                            <button onClick={() => handleTrainerStatus(app.id, 'Rejected')} className="px-3 py-1 bg-rose-900/30 text-rose-400 border border-rose-800/50 rounded hover:bg-rose-800/50">Reject</button>
                          </div>
                        ) : (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${app.status === 'Approved' ? 'bg-emerald-900/20 text-emerald-400 border-emerald-800/30' : 'bg-rose-900/20 text-rose-400 border-rose-800/30'}`}>{app.status}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'business' && (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-medium">Company</th>
                    <th className="px-6 py-4 font-medium">Contact</th>
                    <th className="px-6 py-4 font-medium">Objective</th>
                    <th className="px-6 py-4 font-medium text-right">Action / Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {isLoading ? (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Loading secure database...</td></tr>
                  ) : leads.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No B2B leads currently.</td></tr>
                  ) : leads.map(lead => (
                    <tr key={`lead-${lead.id}`} className="hover:bg-slate-800/50 transition-colors duration-200">
                      <td className="px-6 py-4 font-semibold text-white">{lead.company_name}</td>
                      <td className="px-6 py-4">
                        <div className="text-slate-300">{lead.contact_name}</div>
                        <div className="text-xs text-amber-500 mt-1">{lead.email}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{lead.project_type}</td>
                      <td className="px-6 py-4 text-right">
                        {lead.status === 'New Lead' ? (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleLeadStatus(lead.id, 'Contacted')} className="px-3 py-1 bg-emerald-900/30 text-emerald-400 border border-emerald-800/50 rounded hover:bg-emerald-800/50">Mark Contacted</button>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-900/20 text-emerald-400 border border-emerald-800/30">{lead.status}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'newsletter' && (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-medium">#</th>
                    <th className="px-6 py-4 font-medium">Name</th>
                    <th className="px-6 py-4 font-medium">Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {isLoading ? (
                    <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">Loading secure database...</td></tr>
                  ) : subscribers.length === 0 ? (
                    <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">No subscribers yet.</td></tr>
                  ) : subscribers.map(sub => (
                    <tr key={`sub-${sub.id}`} className="hover:bg-slate-800/50 transition-colors duration-200">
                      <td className="px-6 py-4 text-slate-600 text-xs">{sub.id}</td>
                      <td className="px-6 py-4 font-semibold text-white">{sub.name}</td>
                      <td className="px-6 py-4 text-emerald-400">{sub.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

          </div>
        </div>

      </div>
    </main>
  );
}
