"use client";
import React, { useState } from 'react';
import Link from 'next/link';

const inputClass = "w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-white";
const selectClass = `${inputClass} appearance-none`;
const labelClass = "text-sm font-semibold text-slate-300";

export default function BusinessEarlyAccess() {
  const [formData, setFormData] = useState({
    companyName: '', contactName: '', email: '', phone: '',
    projectType: 'Data Annotation', companySize: '', industry: '',
    budgetRange: '', timeline: '', referralSource: '', message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setFormData(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/b2b/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) setIsSuccess(true);
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
          <div className="p-8 text-center bg-amber-950/30 border border-amber-800/50 rounded-xl">
            <h2 className="text-2xl font-bold text-amber-500 mb-2">Access Request Secured</h2>
            <p className="text-slate-300">Thank you for your interest. We will be in touch shortly to discuss your AI objectives.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Company Name */}
            <div className="space-y-2">
              <label className={labelClass}>Company Name</label>
              <input required type="text" className={inputClass} placeholder="Acme Corp"
                value={formData.companyName} onChange={set('companyName')} />
            </div>

            {/* Contact Name + Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={labelClass}>Contact Name</label>
                <input required type="text" className={inputClass} placeholder="Jane Smith"
                  value={formData.contactName} onChange={set('contactName')} />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Work Email</label>
                <input required type="email" className={inputClass} placeholder="jane@acmecorp.com"
                  value={formData.email} onChange={set('email')} />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className={labelClass}>Phone Number</label>
              <input required type="tel" className={inputClass} placeholder="+1 (555) 000-0000"
                value={formData.phone} onChange={set('phone')} />
            </div>

            {/* Company Size + Industry */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={labelClass}>Company Size</label>
                <select required className={selectClass} value={formData.companySize} onChange={set('companySize')}>
                  <option value="" disabled>Select size</option>
                  <option value="1-10">1–10 employees</option>
                  <option value="11-50">11–50 employees</option>
                  <option value="51-200">51–200 employees</option>
                  <option value="201-1000">201–1,000 employees</option>
                  <option value="1000+">1,000+ employees</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Industry</label>
                <select required className={selectClass} value={formData.industry} onChange={set('industry')}>
                  <option value="" disabled>Select industry</option>
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Education">Education</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Primary Objective */}
            <div className="space-y-2">
              <label className={labelClass}>Primary Objective</label>
              <select className={selectClass} value={formData.projectType} onChange={set('projectType')}>
                <option value="Data Annotation">High-Volume Data Annotation</option>
                <option value="RLHF Training">RLHF / Model Fine-Tuning</option>
                <option value="Custom Development">Custom AI Application Development</option>
                <option value="Consulting">General AI Strategy Consulting</option>
              </select>
            </div>

            {/* Budget Range + Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={labelClass}>Budget Range</label>
                <select required className={selectClass} value={formData.budgetRange} onChange={set('budgetRange')}>
                  <option value="" disabled>Select budget</option>
                  <option value="Under $5K">Under $5K</option>
                  <option value="$5K–$25K">$5K–$25K</option>
                  <option value="$25K–$100K">$25K–$100K</option>
                  <option value="$100K+">$100K+</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Timeline</label>
                <select required className={selectClass} value={formData.timeline} onChange={set('timeline')}>
                  <option value="" disabled>Select timeline</option>
                  <option value="Immediately">Immediately</option>
                  <option value="Within 1 month">Within 1 month</option>
                  <option value="1–3 months">1–3 months</option>
                  <option value="3–6 months">3–6 months</option>
                  <option value="Exploring options">Exploring options</option>
                </select>
              </div>
            </div>

            {/* Referral Source */}
            <div className="space-y-2">
              <label className={labelClass}>How did you hear about us?</label>
              <select required className={selectClass} value={formData.referralSource} onChange={set('referralSource')}>
                <option value="" disabled>Select source</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Google Search">Google Search</option>
                <option value="Referral">Referral</option>
                <option value="Social Media">Social Media</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <label className={labelClass}>Message <span className="text-slate-500 font-normal">(optional)</span></label>
              <textarea
                className={`${inputClass} resize-none`}
                rows={4}
                maxLength={1000}
                placeholder="Tell us about your project or any specific requirements..."
                value={formData.message}
                onChange={set('message')}
              />
              <p className="text-xs text-slate-600 text-right">{formData.message.length}/1000</p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg transition-all duration-300 shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Processing..." : "Request Early Access"}
            </button>

            <p className="mt-4 text-center text-[10px] text-slate-500 leading-relaxed max-w-xs mx-auto">
              By submitting, you agree to the{' '}
              <a href="/guidelines" className="text-cyan-400 hover:underline">Cronan AI® Operational Guidelines</a> and{' '}
              <a href="/privacy" className="text-amber-500 hover:underline">Privacy Policy</a>.
              Your data is protected under our strict confidentiality and secure human-in-the-loop handling protocols.
            </p>

          </form>
        )}
      </div>
    </main>
  );
}
