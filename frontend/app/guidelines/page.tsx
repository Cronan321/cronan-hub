"use client";
import React from 'react';
import Link from 'next/link';

export default function OperationalGuidelines() {
  return (
    <main className="min-h-screen p-8 md:p-24 text-slate-300 font-sans">
      <div className="max-w-4xl mx-auto bg-slate-900/50 p-8 md:p-12 rounded-2xl border border-slate-800 shadow-2xl">
        
        <div className="mb-12 border-b border-slate-800 pb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Operational Guidelines</h1>
          <p className="text-cyan-400 font-semibold tracking-widest uppercase text-sm">Cronan AI</p>
        </div>

        {/* Article I */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 text-cyan-400">Article I: Mission and Purpose</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-200">1.1 Statement of Purpose</h3>
              <p className="text-slate-400 leading-relaxed">
                Cronan AI operates as a specialized micro-agency dedicated to bridging the gap between raw data and high-performing artificial intelligence. Our primary objective is to empower businesses by developing, refining, and optimizing AI models and the datasets that fuel them.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-200 mt-6">1.2 Commitment to Quality</h3>
              <p className="text-slate-400 leading-relaxed">
                We believe that an AI model is only as intelligent as the data it trains on. Cronan AI is committed to rigorous human-in-the-loop (HITL) methodologies, ensuring that every dataset and model iteration meets the highest standards of accuracy, relevance, and ethical alignment.
              </p>
            </div>
          </div>
        </section>

        {/* Article II */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 text-cyan-400">Article II: Core Service Offerings</h2>
          
          <div className="space-y-6">
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
              <h3 className="text-xl font-bold text-amber-500 mb-3">2.1 AI Model Development & Fine-Tuning</h3>
              <p className="text-slate-400 mb-4">Cronan AI partners with businesses to transform foundational AI models into highly specialized tools tailored to their unique operational needs.</p>
              <ul className="list-disc pl-5 space-y-2 text-slate-300">
                <li><strong>Domain-Specific Fine-Tuning:</strong> Adapting existing models to understand industry-specific terminology, workflows, and desired outputs.</li>
                <li><strong>Behavioral Alignment:</strong> Utilizing Reinforcement Learning from Human Feedback (RLHF) to ensure the model responds safely, accurately, and in the brand's desired voice.</li>
                <li><strong>Prompt Engineering & Evaluation:</strong> Crafting rigorous prompt libraries and evaluating model responses to eliminate hallucinations and improve logic pathways.</li>
              </ul>
            </div>

            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
              <h3 className="text-xl font-bold text-amber-500 mb-3">2.2 Custom Dataset Creation</h3>
              <p className="text-slate-400 mb-4">We build bespoke, high-fidelity datasets from the ground up, designed specifically for a client's target use case.</p>
              <ul className="list-disc pl-5 space-y-2 text-slate-300">
                <li><strong>Targeted Data Collection:</strong> Gathering relevant, high-quality raw data points aligned with the client's strategic goals.</li>
                <li><strong>Annotation & Labeling:</strong> Providing expert, human-verified categorization, tagging, and contextual labeling to make raw data machine-readable.</li>
                <li><strong>Diversity & Edge-Case Inclusion:</strong> Intentionally designing datasets that account for edge cases and minimize algorithmic bias.</li>
              </ul>
            </div>

            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
              <h3 className="text-xl font-bold text-amber-500 mb-3">2.3 Dataset Cleaning, Auditing & Optimization</h3>
              <p className="text-slate-400 mb-4">For businesses with existing data, Cronan AI provides comprehensive auditing and refinement services to revitalize degraded or unstructured datasets.</p>
              <ul className="list-disc pl-5 space-y-2 text-slate-300">
                <li><strong>Data Scrubbing:</strong> Identifying and removing duplicates, inaccuracies, and formatting errors that cause model degradation.</li>
                <li><strong>Relevance Updating:</strong> Refreshing stale datasets with current information to ensure the AI remains accurate in a shifting landscape.</li>
                <li><strong>Restructuring:</strong> Organizing chaotic or siloed data into clean, structured formats (e.g., JSONL) ready for seamless ingestion by machine learning pipelines.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Article III */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 text-cyan-400">Article III: Operating Principles & Standards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 border border-slate-700 rounded-lg">
              <h3 className="font-bold text-white mb-2">3.1 Data Privacy & Security</h3>
              <p className="text-sm text-slate-400">Cronan AI treats all client data with strict confidentiality. All datasets, proprietary models, and internal business logic are handled in secure environments to prevent unauthorized access or data leakage.</p>
            </div>
            <div className="p-4 border border-slate-700 rounded-lg">
              <h3 className="font-bold text-white mb-2">3.2 The Human Advantage</h3>
              <p className="text-sm text-slate-400">While we work with artificial intelligence, our foundation is built on expert human intuition. Our training methodologies rely on skilled data specialists to provide the nuanced context and reasoning that automated scrapers simply cannot replicate.</p>
            </div>
            <div className="p-4 border border-slate-700 rounded-lg">
              <h3 className="font-bold text-white mb-2">3.3 Iterative Collaboration</h3>
              <p className="text-sm text-slate-400">We operate on a transparent, milestone-driven basis. Clients are integrated into the feedback loop, allowing for continuous testing and adjustment to ensure the final deliverable perfectly aligns with their business objectives.</p>
            </div>
          </div>
        </section>

        {/* Article IV */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 text-cyan-400">Article IV: Client Engagement & Pricing Structure </h2>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">4.1 Transparent Engagement Models</h3>
          <p className="text-slate-400 mb-4">Cronan AI understands that data needs vary wildly. We offer flexible engagement structures designed to scale with a business's objectives:</p>
          <ul className="list-disc pl-5 mb-8 space-y-2 text-slate-300">
            <li><strong>Project-Based Pricing:</strong> For defined scopes, such as building a specific dataset from scratch or conducting a one-time data cleanup.</li>
            <li><strong>Retainer/Subscription Model:</strong> For ongoing model fine-tuning, continuous RLHF (Reinforcement Learning from Human Feedback), and regular dataset updating.</li>
            <li><strong>Agile Hourly Consulting:</strong> For businesses needing strategic guidance on how to structure their data pipelines or evaluate their current AI outputs.</li>
          </ul>

          <h3 className="text-lg font-semibold text-slate-200 mb-2">4.2 The Onboarding Protocol</h3>
          <p className="text-slate-400 mb-4">Every partnership begins with a comprehensive Discovery Phase.</p>
          <ol className="list-decimal pl-5 space-y-2 text-slate-300">
            <li><strong>Needs Assessment:</strong> Identifying the specific model to be trained or the dataset to be structured.</li>
            <li><strong>Sample Audit:</strong> We process a small sample of the client's data to establish baseline metrics and demonstrate our quality standards.</li>
            <li><strong>Custom Blueprint:</strong> Delivery of a detailed roadmap outlining timelines, specific human-in-the-loop requirements, and precise pricing.</li>
          </ol>
        </section>

        {/* Article V */}
        <section className="mb-12 bg-slate-800/30 p-8 rounded-2xl border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-6 text-cyan-400">Article V: The Cronan AI Workforce & Compensation Standards</h2>
          
          <h3 className="text-xl font-bold text-white mb-2">5.1 Baseline Compensation & Performance-Based Scaling</h3>
          <p className="text-slate-400 mb-4">We believe high-quality AI requires highly motivated human intelligence. All Cronan AI 1099 contract specialists start at a competitive baseline of $15.00 per hour.</p>
          <ul className="list-disc pl-5 mb-6 space-y-2 text-slate-300">
            <li><strong>Merit-Based Advancement:</strong> Compensation scales based on technical expertise, domain-specific knowledge, and consistently exceptional work.</li>
            <li><strong>The Upper Echelon:</strong> Highly specialized, top-performing trainers have the potential to earn up to $120.00 per hour. <em>Please note: This maximum rate is not guaranteed; it is strictly a performance-based ceiling reserved for complex, high-stakes model evaluations and flawless dataset creation.</em></li>
          </ul>

          <div className="bg-emerald-950/40 p-6 rounded-lg border border-emerald-900 mb-6">
            <h3 className="text-lg font-bold text-emerald-400 mb-2">5.2 Immediate Opening: Business Development & Lead Generation</h3>
            <p className="text-slate-300 mb-4">As we prepare for our official launch in April, we have an urgent need for experienced, self-starters to drive our B2B client acquisition.</p>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><strong>The Role:</strong> Tracking down and securing potential business leads who need AI model fine-tuning, dataset creation, or data auditing.</li>
              <li><strong>The Commission:</strong> Lead generators receive a highly lucrative 30% commission on total project sales (calculated after any 1099 project workers are compensated).</li>
              <li><strong>The Ideal Candidate:</strong> Tenacious, experienced in tech or B2B sales, and ready to put in the work immediately to help build the Cronan AI client roster from the ground up.</li>
            </ul>
          </div>

          <h3 className="text-lg font-bold text-white mb-2">5.3 The Pathway to Partnership (Full-Time Transition)</h3>
          <p className="text-slate-400">
            Cronan AI is building a family, not just a task force. We offer a structured 3-month probationary period for all contractors. Consistently performing contractors are offered the opportunity to transition into Full-Time W-2 Employees with comprehensive benefits, continuous upskilling, and performance-based profit sharing.
          </p>
        </section>

        {/* Article VII */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 text-cyan-400">Article VII: Strategic Partnerships & Investment Opportunities</h2>
          
          <div className="space-y-6 text-slate-300">
            <div>
              <h3 className="text-lg font-bold text-amber-500 mb-2">7.1 The Vision for Scalability</h3>
              <p>Cronan AI is positioned at the critical intersection of human intelligence and machine learning. As the demand for highly specialized, bias-free, and domain-specific AI models grows exponentially, our human-in-the-loop (HITL) infrastructure is designed to scale rapidly to meet B2B enterprise needs.</p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-amber-500 mb-2">7.2 Open for Seed Investment & Angel Partnerships</h3>
              <p>As we approach our official launch in April 2026, Cronan Technology is actively exploring strategic financial partnerships. We welcome inquiries from angel investors, venture capitalists, and industry partners who recognize the vital need for high-fidelity dataset creation and rigorous AI fine-tuning.</p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-amber-500 mb-2">7.3 Capital Allocation Strategy</h3>
              <p className="mb-3">Investment capital will be strategically deployed to accelerate our growth across three core pillars:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Workforce Expansion:</strong> Scaling our elite remote workforce of 1099 data specialists and fast-tracking our top performers into full-time W-2 roles to handle enterprise-level data volumes.</li>
                <li><strong>Technological Infrastructure:</strong> Enhancing the proprietary backend systems of The Cronan Hub to streamline secure data ingestion, annotation workflows, and model auditing.</li>
                <li><strong>B2B Market Penetration:</strong> Aggressively expanding our outbound sales initiatives to capture a larger market share of early-stage AI startups and established enterprises needing urgent model refinement.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-amber-500 mb-2">7.4 Investor Inquiries</h3>
              <p>We seek partners who bring more than just capital—we are looking for strategic alignment. Interested parties are encouraged to request our executive summary and introductory pitch materials directly from the founding team.</p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="border-t border-slate-800 pt-8 mt-12 text-center">
          <h2 className="text-xl font-bold text-white mb-4">Direct Leadership Inquiries</h2>
          <p className="text-slate-400 mb-6">
            Cronan AI is proudly founder-led. For serious business partnerships, Pioneer Program enrollment, or urgent commission-based sales applications, you may reach out directly to our executive team.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-8 mb-6">
            <div>
              <p className="text-white font-semibold">Founder: Brianna Cronan</p>
              <a href="mailto:brianna@cronantech.com" className="text-amber-500 hover:text-amber-400">brianna@cronantech.com</a>
            </div>
            <div>
              <p className="text-white font-semibold">Co-Founder: Bethany Cronan</p>
              <a href="mailto:bethany@cronantech.com" className="text-cyan-400 hover:text-cyan-300">bethany@cronantech.com</a>
            </div>
          </div>
          <p className="text-sm text-slate-500">
            For urgent, time-sensitive matters requiring immediate leadership attention, verifiable partners and elite talent may reach our Rome, Georgia office directly at 706.483.8307.
          </p>
        </section>

      </div>
    </main>
  );
}