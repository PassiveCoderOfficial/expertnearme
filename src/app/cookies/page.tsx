import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy — ExpertNear.Me",
  description: "How ExpertNear.Me uses cookies and local storage.",
};

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 text-slate-900 dark:text-white">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-orange-500 mb-2 font-semibold">Legal</p>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">Cookie Policy</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Last updated: May 2026</p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-3">What Are Cookies?</h2>
            <p>Cookies are small text files stored on your device when you visit a website. We also use localStorage — a similar mechanism that stores data locally in your browser without an expiry date unless cleared manually.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-3">Cookies We Use</h2>
            <div className="space-y-4">
              {[
                {
                  name: 'Authentication cookie (session)',
                  type: 'Essential',
                  purpose: 'Keeps you logged in. Contains your user ID, role, and email. HttpOnly — not accessible by JavaScript. Expires when you log out.',
                },
                {
                  name: 'enm-theme (localStorage)',
                  type: 'Preference',
                  purpose: 'Remembers your light/dark/system theme preference. Stored in localStorage — persists until cleared. No expiry.',
                },
                {
                  name: 'enm_country_redirected (cookie)',
                  type: 'Functional',
                  purpose: 'Prevents redirect loops during geo-based country detection. Expires after 60 seconds.',
                },
              ].map(c => (
                <div key={c.name} className="rounded-xl border border-slate-100 dark:border-white/8 bg-white dark:bg-slate-800/30 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-slate-800 dark:text-white text-sm">{c.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      c.type === 'Essential'
                        ? 'bg-green-50 dark:bg-green-500/15 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/25'
                        : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10'
                    }`}>{c.type}</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">{c.purpose}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-3">Third-Party Cookies</h2>
            <p>We do not use any advertising, analytics, or tracking cookies from third parties. We do not integrate Google Analytics, Facebook Pixel, or similar tools.</p>
            <p className="mt-2">External services embedded on our pages (e.g., Google Maps on expert profiles) may set their own cookies subject to their own privacy policies.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-3">Managing Cookies</h2>
            <p>You can clear cookies and localStorage at any time via your browser settings. Clearing authentication cookies will log you out. Clearing <code>enm-theme</code> will reset your theme preference to the system default.</p>
            <p className="mt-2">Most browsers allow you to block or delete cookies. Note that blocking essential cookies will prevent you from staying logged in.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-3">Contact</h2>
            <p>Questions? Email <strong>support@expertnear.me</strong>.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
