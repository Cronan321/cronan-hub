import type { Metadata } from 'next'
import './globals.css'
import PixelBackground from '../components/PixelBackground'
import Header from '../components/Header'

export const metadata: Metadata = {
  title: 'Cronan AI | Launching Soon',
  description: 'High-level data specialist services and AI trainer recruitment.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="text-slate-300 font-sans min-h-screen flex flex-col">
        {/* --- THE BACKGROUND --- */}
        <PixelBackground />
        
        {/* --- GLOBAL HEADER --- */}
        <Header />

        {/* --- MAIN PAGE CONTENT --- */}
        <div className="flex-grow">
          {children}
        </div>

        {/* --- GLOBAL FOOTER --- */}
        <footer className="w-full border-t border-slate-800 bg-slate-950 py-16 text-sm text-slate-400">
          <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-12 text-center md:text-left">
            
            {/* Trainer Contact */}
            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800/50">
              <h3 className="text-white font-bold mb-3 text-lg">AI Trainer Inquiries</h3>
              <p className="mb-4 text-slate-400">For questions regarding our trainer roster, platform experience, or applications, please reach out directly.</p>
              <a href="mailto:Bethany@CronanTech.com" className="inline-flex items-center text-cyan-400 font-semibold hover:text-cyan-300 transition-colors">
                <span className="mr-2">✉</span> Bethany@CronanTech.com
              </a>
            </div>

            {/* Business Contact */}
            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800/50">
              <h3 className="text-white font-bold mb-3 text-lg">Business & Enterprise</h3>
              <p className="mb-4 text-slate-400">For custom AI pipeline development, high-volume data annotation, or early access, please contact our founder.</p>
              <a href="mailto:Brianna@CronanTech.com" className="inline-flex items-center text-amber-500 font-semibold hover:text-amber-400 transition-colors">
                <span className="mr-2">✉</span> Brianna@CronanTech.com
              </a>
            </div>

          </div>
          <div className="mt-12 text-center text-slate-600 border-t border-slate-800/50 pt-8">
            &copy; {new Date().getFullYear()} Cronan Technology®. All rights reserved.
          </div>
          <div className="mt-8 flex justify-center gap-6 text-xs text-slate-500">
            <a href="/guidelines" className="hover:text-slate-300 transition-colors">Operational Guidelines</a>
            <a href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <span>Rome, Georgia Office: 706.483.8307</span>
            <a href="/admin" className="hover:text-slate-400 transition-colors text-slate-700">Staff Login</a>
          </div>
        </footer>

      </body>
    </html>
  )
}