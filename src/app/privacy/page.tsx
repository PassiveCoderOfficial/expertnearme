import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — ExpertNear.Me",
  description: "How ExpertNear.Me collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 text-slate-900 dark:text-white">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-orange-500 mb-2 font-semibold">Legal</p>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">Privacy Policy</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Last updated: May 2026</p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed text-slate-600 dark:text-slate-300">

          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-3">1. What We Collect</h2>
            <p>When you use ExpertNear.Me, we may collect:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Account data:</strong> name, email address, password (hashed), role (buyer/expert/agent).</li>
              <li><strong>Expert profile data:</strong> business name, phone number, location (latitude/longitude), bio, portfolio images, service listings, social links.</li>
              <li><strong>Booking & transaction data:</strong> booking details, payment confirmation references (we do not store card numbers).</li>
              <li><strong>Usage data:</strong> pages visited, search queries, IP address, browser type.</li>
              <li><strong>Communications:</strong> messages sent through the platform messaging system.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-3">2. How We Use Your Data</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To create and manage your account.</li>
              <li>To display your expert profile to potential clients.</li>
              <li>To process bookings and send confirmation notifications.</li>
              <li>To improve platform performance and fix bugs.</li>
              <li>To send service-related emails (account verification, booking updates). We do not send marketing emails without consent.</li>
              <li>To comply with applicable laws.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-3">3. Data Sharing</h2>
            <p>We do not sell your personal data. We share data only in these cases:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Public profile:</strong> Expert profiles (name, business name, location, services, reviews) are publicly visible by design.</li>
              <li><strong>Service providers:</strong> We use Supabase (database/storage), Vercel (hosting), and LemonSqueezy (payments). Each processes data under their own privacy policies.</li>
              <li><strong>Legal requirement:</strong> If required by law or court order.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-3">4. Cookies & Local Storage</h2>
            <p>We use cookies and localStorage for:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Authentication (JWT token stored in a secure cookie).</li>
              <li>Theme preference (<code>enm-theme</code>).</li>
              <li>Country redirect prevention (<code>enm_country_redirected</code>).</li>
            </ul>
            <p className="mt-2">We do not use advertising or tracking cookies from third parties.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-3">5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Access the personal data we hold about you.</li>
              <li>Correct inaccurate data via your profile settings.</li>
              <li>Request deletion of your account and associated data.</li>
              <li>Export your data (contact us to request).</li>
            </ul>
            <p className="mt-2">To exercise any right, email us at <strong>support@expertnear.me</strong>.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-3">6. Data Retention</h2>
            <p>We retain account data for as long as your account is active. If you delete your account, we remove personal data within 30 days, except where retention is required by law (e.g., transaction records).</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-3">7. Security</h2>
            <p>Passwords are bcrypt-hashed. Data is transmitted over HTTPS. We use Supabase row-level security and JWT-based authentication. No system is completely secure, but we take reasonable measures to protect your data.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-3">8. Contact</h2>
            <p>Questions about this policy? Contact us at <strong>support@expertnear.me</strong> or via WhatsApp at <strong>+880 167 866 9699</strong>.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
