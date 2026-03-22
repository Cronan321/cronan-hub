"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function BusinessEarlyAccess() {
  const [formData, setFormData] = useState({ companyName: '', contactName: '', email: '', projectType: 'Data Annotation' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/b2b/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSuccess(true);
      }
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-8 text-slate-300 font-sans">
      <div className="w-full max-w-2xl p-8 bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-[0_0_40px_rgba(245,158,11,0.05)] border border-slate-800 relative overflow-hidden">
        
        <Link href="/" className="inline-flex items-center text-sm text-amber-500 hover:text-amber-400 transition-colors mb-8 group">
          <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> Back to The Hub
        </Link>

        <header className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Business <span className="text-amber-500">Early Access</span></h1>
          <p className="text-slate-400">Secure your spot for high-level data specialist services and AI pipeline development.</p>
        </header>

        {isSuccess ? (
          <div className="p-8 text-center bg-amber-950/30 border border-amber-800/50 rounded-xl animate-fade-in">
            <h2 className="text-2xl font-bold text-amber-500 mb-2">Access Request Secured</h2>
            <p className="text-slate-300">Thank you for your interest. We will be in touch shortly to discuss your AI objectives.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Company Name</label>
              <input 
                required 
                type="text" 
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-white"
                placeholder="Acme Corp"
                value={formData.companyName}
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">Contact Name</label>
                <input 
                  required 
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-white"
                  placeholder="John Smith"
                  value={formData.contactName}
                  onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">Work Email</label>
                <input 
                  required 
                  type="email" 
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-white"
                  placeholder="john@acmecorp.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Primary Objective</label>
              <select 
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-white appearance-none"
                value={formData.projectType}
                onChange={(e) => setFormData({...formData, projectType: e.target.value})}
              >
                <option value="Data Annotation">High-Volume Data Annotation</option>
                <option value="RLHF Training">RLHF / Model Fine-Tuning</option>
                <option value="Custom Development">Custom AI Application Development</option>
                <option value="Consulting">General AI Strategy Consulting</option>
              </select>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg transition-all duration-300 shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Processing..." : "Request Early Access"}
            </button>
            <p className="mt-4 text-center text-[10px] text-slate-500 leading-relaxed max-w-xs mx-auto">
  By submitting, you agree to the <a href="/guidelines" className="text-cyan-400 hover:underline">Cronan AI® Operational Guidelines</a> and <a href="/privacy" className="text-amber-500 hover:underline">Privacy Policy</a>. 
  Your data is protected under our strict confidentiality and secure human-in-the-loop handling protocols.
</p>

          </form>
        )}
      </div>
    </main>
  );
}