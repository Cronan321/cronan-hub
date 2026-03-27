import React from 'react';
import Link from 'next/link';

export default function InvestorsPage() {
  return (
    <main className="min-h-screen p-8 md:p-24 text-slate-300 font-sans">
      <div className="max-w-4xl mx-auto bg-slate-900/50 p-8 md:p-12 rounded-2xl border border-slate-800 shadow-2xl">

        <div className="mb-8">
          <Link href="/" className="text-amber-500 hover:text-amber-400 transition-colors text-sm font-medium">
            ← Back to The Hub
          </Link>
        </div>

        <div className="mb-12 border-b border-slate-800 pb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Strategic Partnerships &amp; Investment</h1>
          <p className="text-amber-500 font-semibold tracking-widest uppercase text-sm">Cronan AI</p>
        </div>

        <div className="space-y-8 text-slate-300">

          {/* 7.1 */}
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
            <h2 className="text-xl font-bold text-amber-500 mb-3">7.1 The Vision for Scalability</h2>
            <p className="text-slate-400 leading-relaxed">
              Cronan AI is positioned at the critical intersection of human intelligence and machine learning. As the demand for highly specialized, bias-free, and domain-specific AI models grows exponentially, our human-in-the-loop (HITL) infrastructure is designed to scale rapidly to meet B2B enterprise needs.
            </p>
          </div>

          {/* 7.2 */}
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
            <h2 className="text-xl font-bold text-amber-500 mb-3">7.2 Open for Seed Investment &amp; Angel Partnerships</h2>
            <p className="text-slate-400 leading-relaxed">
              As we approach our official launch in April 2026, Cronan Technology is actively exploring strategic financial partnerships. We welcome inquiries from angel investors, venture capitalists, and industry partners who recognize the vital need for high-fidelity dataset creation and rigorous AI fine-tuning.
            </p>
          </div>

          {/* 7.3 */}
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
            <h2 className="text-xl font-bold text-amber-500 mb-3">7.3 Capital Allocation Strategy</h2>
            <p className="text-slate-400 mb-4 leading-relaxed">
              Investment capital will be strategically deployed to accelerate our growth across three core pillars:
            </p>
            <ul className="list-disc pl-5 space-y-3 text-slate-300">
              <li>
                <strong>Workforce Expansion:</strong> Scaling our elite remote workforce of 1099 data specialists and fast-tracking our top performers into full-time W-2 roles to handle enterprise-level data volumes.
              </li>
              <li>
                <strong>Technological Infrastructure:</strong> Enhancing the proprietary backend systems of The Cronan Hub to streamline secure data ingestion, annotation workflows, and model auditing.
              </li>
              <li>
                <strong>B2B Market Penetration:</strong> Aggressively expanding our outbound sales initiatives to capture a larger market share of early-stage AI startups and established enterprises needing urgent model refinement.
              </li>
            </ul>
          </div>

          {/* 7.4 */}
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
            <h2 className="text-xl font-bold text-amber-500 mb-3">7.4 Investor Inquiries</h2>
            <p className="text-slate-400 leading-relaxed">
              We seek partners who bring more than just capital—we are looking for strategic alignment. Interested parties are encouraged to request our executive summary and introductory pitch materials directly from the founding team.
            </p>
          </div>

        </div>

        {/* Contact Section */}
        <section className="border-t border-slate-800 pt-8 mt-12 text-center">
          <h2 className="text-xl font-bold text-white mb-4">Contact the Founding Team</h2>
          <p className="text-slate-400 mb-6">
            For investor inquiries, partnership proposals, or to request our executive summary and pitch materials, reach out directly to our founders.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-8">
            <div>
              <p className="text-white font-semibold">Founder: Brianna Cronan</p>
              <a href="mailto:Brianna@CronanTech.com" className="text-amber-500 hover:text-amber-400 transition-colors">
                Brianna@CronanTech.com
              </a>
            </div>
            <div>
              <p className="text-white font-semibold">Co-Founder: Bethany Cronan</p>
              <a href="mailto:Bethany@CronanTech.com" className="text-amber-500 hover:text-amber-400 transition-colors">
                Bethany@CronanTech.com
              </a>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
