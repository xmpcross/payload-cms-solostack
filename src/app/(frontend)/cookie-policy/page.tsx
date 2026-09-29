import type { Metadata } from 'next'
import React from 'react'
import Link from 'next/link'
import { ShieldCheck, Cookie, FileText, Lock, ArrowLeft } from 'lucide-react'

export const revalidate = 3600 // Cache for 1 hour

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Cookie Policy | SoloStack',
    description: 'Learn how SoloStack uses cookies and tracking technologies to ensure site functionality, analytics, and affiliate link attribution.',
    openGraph: {
      title: 'Cookie Policy | SoloStack',
      description: 'Learn how SoloStack uses cookies and tracking technologies.',
      type: 'website',
      url: 'https://solostack.au/cookie-policy',
    },
    alternates: {
      canonical: 'https://solostack.au/cookie-policy',
    },
  }
}

export default function CookiePolicyPage() {
  const lastUpdated = 'September 29, 2026'

  return (
    <div className="pt-12 pb-24 min-h-screen bg-slate-50/50 dark:bg-neutral-950 text-slate-900 dark:text-neutral-100">
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="space-y-3 border-b border-slate-200 dark:border-neutral-800 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200/80 dark:border-indigo-800/80">
            <Cookie className="h-3.5 w-3.5 text-indigo-500" />
            <span>Privacy & Compliance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Cookie Policy
          </h1>
          <p className="text-xs text-slate-500 dark:text-neutral-400">
            Last Updated: {lastUpdated} &bull; Operated by FXN Holdings (solostack.au)
          </p>
        </div>

        {/* Policy Content Card */}
        <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-10 shadow-2xs space-y-8 text-sm text-slate-700 dark:text-neutral-300 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs flex items-center justify-center font-mono font-bold">1</span>
              What Are Cookies?
            </h2>
            <p>
              Cookies are small data files stored on your device (computer, tablet, or mobile phone) when you visit web pages. They help website owners deliver smooth functionality, retain user preferences, monitor site performance, and ensure secure link navigation.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 pt-4 border-t border-slate-100 dark:border-neutral-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs flex items-center justify-center font-mono font-bold">2</span>
              How SoloStack Uses Cookies
            </h2>
            <p>
              SoloStack uses cookies and related local storage mechanisms for the following primary operational purposes:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Strictly Necessary &amp; Security Cookies:</strong> Essential for standard page rendering, theme toggle states, and preventing security vulnerabilities.
              </li>
              <li>
                <strong>Performance &amp; Analytics Cookies:</strong> Measure visitor traffic patterns and popular blueprint pages so we can continuously improve content quality.
              </li>
              <li>
                <strong>Affiliate &amp; Partner Attribution Cookies:</strong> When you click on partner deals or voucher codes (e.g. CJ Affiliate or Awin Network partner links), a temporary partner cookie or referral parameter (`clickref` or `sid`) is passed to the merchant so that any subsequent qualifying purchase can be accurately attributed to SoloStack.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 pt-4 border-t border-slate-100 dark:border-neutral-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs flex items-center justify-center font-mono font-bold">3</span>
              Third-Party Cookies &amp; Partners
            </h2>
            <p>
              Some cookies placed on your browser originate from authorized third-party service providers and affiliate networks:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>CJ Affiliate (Commission Junction):</strong> Tracking cookie duration typically ranges from 30 to 90 days.</li>
              <li><strong>Awin Network:</strong> Attribution tracking for verified merchant promotional offers.</li>
              <li><strong>Google Analytics:</strong> Anonymized performance reporting and user engagement metrics.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 pt-4 border-t border-slate-100 dark:border-neutral-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs flex items-center justify-center font-mono font-bold">4</span>
              Managing &amp; Disabling Cookies
            </h2>
            <p>
              You have full control over cookie preferences through your web browser settings. Most modern browsers allow you to block, delete, or inspect cookies. Note that disabling essential cookies may impact certain site interactive capabilities.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 pt-4 border-t border-slate-100 dark:border-neutral-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs flex items-center justify-center font-mono font-bold">5</span>
              Contact Us &amp; Policy Updates
            </h2>
            <p>
              We may update this Cookie Policy periodically to reflect technological or legal updates. If you have questions regarding our cookie practices, please contact us at:
            </p>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-850 border border-slate-200 dark:border-neutral-800 text-xs space-y-1 font-mono">
              <p className="font-bold text-slate-900 dark:text-white font-sans">SoloStack Compliance Team</p>
              <p>Operated by FXN Holdings (ABN: 53 274 423 748)</p>
              <p>Email: <a href="mailto:contact@solostack.au" className="text-indigo-600 dark:text-indigo-400 underline">contact@solostack.au</a></p>
              <p>Address: PO Box 500, WEST PERTH, WA 6872, Australia</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
