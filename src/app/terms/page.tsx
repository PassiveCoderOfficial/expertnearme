import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — ExpertNear.Me",
  description: "Terms and conditions for using ExpertNear.Me as a buyer, expert, or agent.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 text-slate-900 dark:text-white">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-orange-500 mb-2 font-semibold">Legal</p>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">Terms of Service</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Last updated: May 2026</p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed text-slate-600 dark:text-slate-300">

          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-3">1. Acceptance</h2>
            <p>By accessing or using ExpertNear.Me (&quot;the Platform&quot;), you agree to these Terms. If you do not agree, do not use the Platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-3">2. Who Can Use ExpertNear.Me</h2>
            <p>You must be at least 18 years old. By registering, you confirm that the information you provide is accurate and that you have authority to represent any business you list.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-3">3. Expert Listings</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Expert profiles are manually verified before going live. We reserve the right to reject or remove listings that are misleading, inappropriate, or violate these terms.</li>
              <li>Experts are responsible for the accuracy of their profile information, services, pricing, and availability.</li>
              <li>Experts must not list services they are not qualified or licensed to provide.</li>
              <li>Founding Expert status is granted upon successful payment confirmation and profile approval. The Founding Expert deal is available until August 15, 2026 or until 500 spots are claimed.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-3">4. Payments & Refunds</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Founding Expert (Lifetime):</strong> A one-time payment. If your application is rejected after payment, you will receive a full refund within 7 business days.</li>
              <li><strong>Subscriptions:</strong> Billed monthly or yearly. Cancellations take effect at the end of the current billing period. No partial refunds for unused periods.</li>
              <li><strong>30-day money-back guarantee:</strong> Applies to the Founding Expert lifetime plan for new customers. Request via support@expertnear.me within 30 days of activation.</li>
              <li>We do not store payment card details. Payments are processed by LemonSqueezy or via verified manual transfer.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-3">5. Bookings & Disputes</h2>
            <p>ExpertNear.Me facilitates connections between buyers and experts. We are not a party to any agreement made between them. Disputes between buyers and experts are their own responsibility. We may, at our discretion, mediate disputes but are not obligated to do so.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-3">6. Reviews</h2>
            <p>Reviews must be honest and based on real interactions. We reserve the right to remove reviews that are fraudulent, abusive, or violate community standards. Experts must not solicit fake reviews.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-3">7. Prohibited Use</h2>
            <p>You must not:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Impersonate any person or entity.</li>
              <li>Post false, misleading, or fraudulent content.</li>
              <li>Use the platform to spam, phish, or harvest user data.</li>
              <li>Attempt to circumvent platform verification or payment systems.</li>
              <li>Scrape or copy platform data without written permission.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-3">8. Intellectual Property</h2>
            <p>The ExpertNear.Me name, logo, and platform design are our property. Expert profiles remain the property of the expert. By listing on the platform, you grant us a non-exclusive license to display your profile content to users.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-3">9. Limitation of Liability</h2>
            <p>ExpertNear.Me is provided &quot;as is.&quot; We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform, including any issues arising from engagements between buyers and experts.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-3">10. Changes to Terms</h2>
            <p>We may update these terms from time to time. Continued use after changes constitutes acceptance. We will notify registered users of material changes via email.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-3">11. Contact</h2>
            <p>Questions? Email <strong>support@expertnear.me</strong> or message us on WhatsApp at <strong>+880 167 866 9699</strong>.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
