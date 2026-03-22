 "use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function AgencyApply() {
  const [formData, setFormData] = useState({ name: '', email: '', specialty: 'coding', experience: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/apply`, {
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
      <div className="w-full max-w-2xl p-8 bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-[0_0_40px_rgba(34,211,238,0.05)] border border-slate-800 relative overflow-hidden">
        
        {/* Back to Hub Link */}
        <Link href="/" className="inline-flex items-center text-sm text-cyan-400 hover:text-cyan-300 transition-colors mb-8 group">
          <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> Back to The Hub
        </Link>

        <header className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Join <span className="text-cyan-400">Cronan AI</span></h1>
          <p className="text-slate-400">Join our elite roster of AI trainers and data specialists.</p>
        </header>

        {isSuccess ? (
          <div className="p-8 text-center bg-cyan-950/30 border border-cyan-800 rounded-xl animate-fade-in">
            <h2 className="text-2xl font-bold text-cyan-400 mb-2">Application Received</h2>
            <p className="text-slate-300">Thank you for applying. Our team will review your credentials and be in touch soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">Full Name</label>
                <input 
                  required 
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-white"
                  placeholder="Jane Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">Email Address</label>
                <input 
                  required 
                  type="email" 
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-white"
                  placeholder="jane@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            {/* Specialty Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Primary AI Training Specialty</label>
              <select 
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-white appearance-none"
                value={formData.specialty}
                onChange={(e) => setFormData({...formData, specialty: e.target.value})}
              >
                <option value="coding">Software Engineering / Code Generation</option>
                <option value="writing">Creative Writing / Copywriting</option>
                <option value="math">Mathematics / Logic Reasoning</option>
                <option value="general">General RLHF / Fact-Checking</option>
              </select>
            </div>

            {/* Experience Textarea */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Platform Experience & Background</label>
              <textarea 
                required 
                rows={4}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-white resize-none"
                placeholder="List previous platforms (e.g., Outlier, DataAnnotations, Alignerr) and briefly describe your professional background."
                value={formData.experience}
                onChange={(e) => setFormData({...formData, experience: e.target.value})}
              ></textarea>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-all duration-300 shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
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