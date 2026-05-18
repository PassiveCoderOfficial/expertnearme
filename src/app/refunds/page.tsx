import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy — ExpertNear.Me",
  description: "ExpertNear.Me refund and cancellation policy for subscriptions and lifetime deals.",
};

export default function RefundsPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 text-slate-900 dark:text-white">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-orange-500 mb-2 font-semibold">Legal</p>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">Refund Policy</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Last updated: May 2026</p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-slate-600 dark:text-slate-300">

          <div className="rounded-2xl border border-green-200 dark:border-green-500/25 bg-green-50 dark:bg-green-500/10 p-6">
            <p className="font-bold text-green-700 dark:text-green-400 text-base mb-2">30-Day Money-Back Guarantee</p>
            <p className="text-green-700 dark:text-green-300">
              We offer a full refund within <strong>30 days</strong> of purchase for the Founding Expert lifetime plan. No questions asked. Contact <strong>support@expertnear.me</strong> with your order reference.
            </p>
          </div>

          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-3">Founding Expert (Lifetime Deal)</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>30-day money-back guarantee</strong> from the date of purchase activation.</li>
              <li>After 30 days, the purchase is final and non-refundable.</li>
              <li>If your application is <strong>rejected</strong> after payment (e.g., listing doesn't meet our guidelines), you will receive a full refund regardless of the 30-day window.</li>
              <li>To request a refund, email <strong>support@expertnear.me</strong> with your purchase email and order ID.</li>
              <li>Refunds are processed within <strong>7 business days</strong> back to the original payment method.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-3">Pro Subscriptions (Monthly / Yearly)</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>You may cancel your subscription at any time from your dashboard (<Link href="/dashboard/my-subscription" className="text-orange-500 hover:underline">My Subscription</Link>).</li>
              <li>Cancellation takes effect at the end of the current billing period. You retain full access until then.</li>
              <li>We do not provide <strong>partial refunds</strong> for unused days in a billing period.</li>
              <li>If you are charged after a successful cancellation request (due to a technical error), we will refund the erroneous charge in full.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-3">Ad Campaigns</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Ad credits and campaign spend are <strong>non-refundable</strong> once a campaign has been activated and impressions have been served.</li>
              <li>If a campaign is rejected by our moderation team before activation, credits are returned in full.</li>
              <li>If a campaign is cancelled by us due to policy violations, no refund is issued.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-3">Chargebacks</h2>
            <p>Please contact us before initiating a chargeback. We respond to all refund requests promptly. Fraudulent chargebacks may result in account suspension.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-3">How to Request a Refund</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Email <strong>support@expertnear.me</strong> with subject line: <em>"Refund Request — [your email]"</em>.</li>
              <li>Include your purchase email and order ID (from LemonSqueezy confirmation email or manual payment receipt).</li>
              <li>We will confirm receipt within 24 hours and process within 7 business days.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-3">Contact</h2>
            <p>Questions? <Link href="/contact" className="text-orange-500 hover:underline">Contact us</Link> or email <strong>support@expertnear.me</strong>.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
