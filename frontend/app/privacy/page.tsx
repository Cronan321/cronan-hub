import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen p-8 md:p-24 text-slate-300 font-sans">
      <div className="max-w-4xl mx-auto bg-slate-900/50 p-8 md:p-12 rounded-2xl border border-slate-800 shadow-2xl">

        <div className="mb-8">
          <Link href="/" className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm font-semibold">
            ← Back to The Hub
          </Link>
        </div>

        <div className="mb-12 border-b border-slate-800 pb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Privacy Policy</h1>
          <p className="text-cyan-400 font-semibold tracking-widest uppercase text-sm">Cronan AI</p>
          <p className="text-slate-500 text-sm mt-2">Last updated: July 2025</p>
        </div>

        {/* Data We Collect */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-cyan-400 mb-6">Data We Collect</h2>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              When you interact with Cronan AI through our website or application forms, we collect the following categories of information:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-300">
              <li><strong>Identity Information:</strong> Your full name and professional title or specialty.</li>
              <li><strong>Contact Information:</strong> Email address and phone number.</li>
              <li><strong>Professional Information:</strong> LinkedIn or portfolio URLs, areas of expertise, and availability.</li>
              <li><strong>Business Information:</strong> Company name, company size, industry, project type, budget range, and timeline (for B2B inquiries).</li>
              <li><strong>Communication Data:</strong> Any messages or notes you submit through our contact or application forms.</li>
              <li><strong>Usage Data:</strong> Standard web analytics such as page views, browser type, and referring URLs, collected automatically when you visit our site.</li>
            </ul>
            <p>
              We do not collect payment information directly. We do not use tracking cookies for advertising purposes.
            </p>
          </div>
        </section>

        {/* How We Use Your Data */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-cyan-400 mb-6">How We Use Your Data</h2>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>The information you provide is used solely for legitimate business purposes:</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-300">
              <li><strong>Application Processing:</strong> To review and respond to trainer applications and B2B partnership inquiries.</li>
              <li><strong>Internal Notifications:</strong> To alert our founding team when a new application or inquiry is submitted.</li>
              <li><strong>Communication:</strong> To follow up with you regarding your application status or business inquiry.</li>
              <li><strong>Platform Improvement:</strong> Aggregated, anonymized usage data may be used to improve the functionality and user experience of our platform.</li>
            </ul>
            <p>
              We do not sell, rent, or trade your personal information to third parties. We do not use your data for automated decision-making or profiling.
            </p>
          </div>
        </section>

        {/* Data Storage & Security */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-cyan-400 mb-6">Data Storage &amp; Security</h2>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              Submitted application data is stored in a secured database hosted on our backend infrastructure. We implement the following measures to protect your information:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-300">
              <li><strong>Encrypted Transmission:</strong> All data is transmitted over HTTPS/TLS.</li>
              <li><strong>Access Controls:</strong> Database access is restricted to authorized Cronan AI staff only, protected by secure authentication.</li>
              <li><strong>Minimal Retention:</strong> We retain your data only as long as necessary to fulfill the purpose for which it was collected or as required by applicable law.</li>
              <li><strong>No Public Exposure:</strong> Application data is never displayed publicly and is only accessible through our internal admin tools.</li>
            </ul>
            <p>
              While we take reasonable precautions, no method of electronic storage is 100% secure. We encourage you to contact us immediately if you believe your information has been compromised.
            </p>
          </div>
        </section>

        {/* Third-Party Services */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-cyan-400 mb-6">Third-Party Services</h2>
          <p className="text-slate-400 mb-6 leading-relaxed">
            Cronan AI uses a small number of trusted third-party services to operate our platform. Each service has its own privacy policy governing how they handle data.
          </p>
          <div className="space-y-4">
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
              <h3 className="text-lg font-bold text-amber-500 mb-2">Resend</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                We use Resend to send transactional email notifications to our founding team when new applications are submitted. Resend processes the email addresses and names included in those notifications. Resend does not store your data beyond what is necessary to deliver the email.
              </p>
            </div>
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
              <h3 className="text-lg font-bold text-amber-500 mb-2">Vercel</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Our frontend application is hosted on Vercel. Vercel may collect standard server logs including IP addresses and request metadata as part of normal hosting operations. These logs are governed by Vercel&apos;s privacy policy.
              </p>
            </div>
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
              <h3 className="text-lg font-bold text-amber-500 mb-2">Render</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Our backend API and database are hosted on Render. Application data submitted through our forms is stored on Render&apos;s infrastructure. Render&apos;s data handling practices are governed by their privacy policy and applicable data protection regulations.
              </p>
            </div>
          </div>
        </section>

        {/* Your Rights */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-cyan-400 mb-6">Your Rights</h2>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>Depending on your location, you may have the following rights regarding your personal data:</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-300">
              <li><strong>Right to Access:</strong> You may request a copy of the personal information we hold about you.</li>
              <li><strong>Right to Correction:</strong> You may request that we correct inaccurate or incomplete information.</li>
              <li><strong>Right to Deletion:</strong> You may request that we delete your personal data, subject to any legal obligations we may have to retain it.</li>
              <li><strong>Right to Withdraw Consent:</strong> Where processing is based on consent, you may withdraw that consent at any time.</li>
              <li><strong>Right to Object:</strong> You may object to certain types of processing, including direct marketing.</li>
            </ul>
            <p>
              To exercise any of these rights, please contact us using the information in the section below. We will respond to all legitimate requests within a reasonable timeframe.
            </p>
          </div>
        </section>

        {/* Contact Information */}
        <section className="border-t border-slate-800 pt-8 mt-12">
          <h2 className="text-2xl font-bold text-cyan-400 mb-6">Contact Information</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            If you have any questions, concerns, or requests regarding this Privacy Policy or the handling of your personal data, please reach out to our founding team directly.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-8 text-center">
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex-1">
              <p className="text-white font-semibold mb-1">Founder: Brianna Cronan</p>
              <p className="text-slate-500 text-sm mb-3">Business &amp; Enterprise Inquiries</p>
              <a href="mailto:Brianna@CronanTech.com" className="text-amber-500 hover:text-amber-400 transition-colors font-semibold">
                Brianna@CronanTech.com
              </a>
            </div>
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex-1">
              <p className="text-white font-semibold mb-1">Co-Founder: Bethany Cronan</p>
              <p className="text-slate-500 text-sm mb-3">Trainer &amp; Platform Inquiries</p>
              <a href="mailto:Bethany@CronanTech.com" className="text-cyan-400 hover:text-cyan-300 transition-colors font-semibold">
                Bethany@CronanTech.com
              </a>
            </div>
          </div>
          <p className="text-sm text-slate-500 text-center mt-8">
            &copy; {new Date().getFullYear()} Cronan Technology&reg;. All rights reserved. &middot; Rome, Georgia
          </p>
        </section>

      </div>
    </main>
  );
}
