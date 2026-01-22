// src/app/pricing/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const proMonthly = 39;
  const proAnnual = 195; // limited-time annual price
  const vipMonthly = 89;
  const vipAnnual = 445; // <-- updated yearly VIP price

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Hero / Header */}
      <header className="bg-gradient-to-r from-[#fff5f5] to-white border-b border-[#f0d6d6]">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Pricing that grows with your business
            </h1>
            <p className="mt-3 text-gray-600 max-w-xl">
              Free listings forever. Upgrade to Pro or VIP for booking tools, priority placement,
              analytics, and business features that help you convert more leads.
            </p>

            <div className="mt-4 inline-flex items-center gap-3 bg-[#fff0f0] border border-[#f0cfcf] rounded-full px-3 py-1 text-sm text-[#b84c4c]">
              <strong className="font-semibold">Limited time:</strong>
              <span>Claim a 30‑day free VIP upgrade for any account — Free or Pro.</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-5 py-3 rounded-md bg-[#b84c4c] text-white font-medium shadow hover:bg-[#a43f3f]"
            >
              Get started
            </Link>

            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
            >
              Contact sales
            </Link>
          </div>
        </div>
      </header>

      {/* Billing toggle */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-2 rounded-md ${billingCycle === "monthly" ? "bg-[#b84c4c] text-white" : "bg-gray-100 text-gray-700"}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("annual")}
            className={`px-4 py-2 rounded-md ${billingCycle === "annual" ? "bg-[#b84c4c] text-white" : "bg-gray-100 text-gray-700"}`}
          >
            Annual (limited-time)
          </button>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="max-w-6xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free */}
          <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Free</h3>
              <span className="text-sm text-gray-500">Forever</span>
            </div>

            <div className="mt-6">
              <div className="text-3xl font-extrabold text-gray-900">$0</div>
              <p className="mt-2 text-sm text-gray-600">Basic listing and search visibility</p>
            </div>

            <ul className="mt-6 space-y-3 text-sm text-gray-700">
              <li>✅ Searchable profile in categories</li>
              <li>✅ Visible phone number</li>
              <li>✅ Message form (inbound leads)</li>
              <li>✅ Website slot on profile</li>
              <li>✅ Basic analytics (views, contact clicks, booking requests)</li>
              <li>❌ No WhatsApp button</li>
              <li>❌ No booking widget</li>
              <li>❌ No verified badge</li>
            </ul>

            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/signup"
                className="block text-center px-4 py-2 rounded-md bg-white border border-[#b84c4c] text-[#b84c4c] font-medium hover:bg-[#fff5f5]"
              >
                Create free listing
              </Link>

              <Link
                href="/pricing/claim-trial"
                className="block text-center px-4 py-2 rounded-md bg-[#f7f7f7] border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
              >
                Claim 30 Days Free Upgrade to VIP
              </Link>
            </div>
          </div>

          {/* Pro */}
          <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Pro</h3>
              <span className="text-sm text-gray-500">Best for growing businesses</span>
            </div>

            <div className="mt-6">
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-extrabold text-gray-900">
                  ${billingCycle === "monthly" ? proMonthly : proAnnual}
                </div>
                <div className="text-sm text-gray-600">
                  /{billingCycle === "monthly" ? "month" : "year"}
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600">Booking tools, priority placement, and analytics</p>
            </div>

            <ul className="mt-6 space-y-3 text-sm text-gray-700">
              <li>✅ Booking widget (calendar + request form)</li>
              <li>✅ Visible phone number + WhatsApp button</li>
              <li>✅ Priority listing in category results</li>
              <li>✅ Basic & enhanced analytics (views, leads, bookings)</li>
              <li>✅ CSV export of leads</li>
              <li>✅ Calendar sync (Google Calendar)</li>
              <li>✅ Website slot on profile</li>
              <li>✅ 30‑day free VIP upgrade available via button</li>
              <li>❌ Sponsored search placement (VIP feature)</li>
              <li>❌ Subdomain minisite (VIP feature)</li>
              <li>❌ Verified badge (VIP only)</li>
            </ul>

            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/signup?plan=pro"
                className="block text-center px-4 py-2 rounded-md bg-[#b84c4c] text-white font-medium hover:bg-[#a43f3f]"
              >
                Start Pro
              </Link>

              <Link
                href="/pricing/claim-trial"
                className="block text-center px-4 py-2 rounded-md bg-[#f7f7f7] border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
              >
                Claim 30 Days Free Upgrade to VIP
              </Link>
            </div>
          </div>

          {/* VIP */}
          <div className="border border-[#7a1f1f]/40 rounded-2xl p-6 bg-[#7a1f1f]/90 backdrop-blur-md text-white shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">VIP</h3>
              <span className="text-sm text-pink-200 font-medium">Premium business suite</span>
            </div>

            <div className="mt-6">
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-extrabold text-white">
                  ${billingCycle === "monthly" ? vipMonthly : vipAnnual}
                </div>
                <div className="text-sm text-gray-200">
                  /{billingCycle === "monthly" ? "month" : "year"}
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-200">
                Website builder, sponsored placement, CRM & accounting tools
              </p>
            </div>

            <ul className="mt-6 space-y-3 text-sm text-gray-100">
              <li>✅ Everything in Pro</li>
              <li>✅ Subdomain minisite (e.g., <span className="font-mono">yourname.expertnear.me</span>)</li>
              <li>✅ Website builder & custom mini‑site</li>
              <li>✅ Sponsored search placement (priority & featured slots)</li>
              <li>✅ Verified badge after verification</li>
              <li>✅ Advanced analytics & conversion reports</li>
              <li>✅ CRM & webhook integrations (outbound webhooks, Zapier/Make, native connectors planned)</li>
              <li>✅ Invoicing, simple accounting, and customer pipeline (VIP dashboard)</li>
              <li>✅ White‑glove onboarding & priority support</li>
            </ul>

            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/signup?plan=vip"
                className="block text-center px-4 py-2 rounded-md bg-[#ffffff] text-[#7a1f1f] font-medium hover:bg-[#ffffff]/70"
              >
                Request VIP access
              </Link>

              <Link
                href="/pricing/claim-trial"
                className="block text-center px-4 py-2 rounded-md bg-transparent border border-pink-200 text-sm text-pink-200 hover:bg-[#7a1f1f]/50"
              >
                Claim 30 Days Free Upgrade to VIP
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature highlights / details */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">What you get</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 border border-gray-100 rounded-xl">
            <h4 className="font-semibold mb-2">Listing & Discovery</h4>
            <p className="text-sm text-gray-600">
              Free profiles are searchable and visible in category pages. Pro and VIP profiles get
              priority placement and featured slots to increase discovery.
            </p>
          </div>

          <div className="p-6 border border-gray-100 rounded-xl">
            <h4 className="font-semibold mb-2">Leads & Booking</h4>
            <p className="text-sm text-gray-600">
              Pro includes a booking widget and WhatsApp button to convert visitors into leads.
              VIP adds CRM/webhook integrations and advanced pipeline tools to manage and convert
              leads at scale.
            </p>
          </div>

          <div className="p-6 border border-gray-100 rounded-xl">
            <h4 className="font-semibold mb-2">Website & Brand</h4>
            <p className="text-sm text-gray-600">
              Every profile has a website slot. VIP members can publish a subdomain minisite and use
              the built‑in website builder to present a richer brand experience.
            </p>
          </div>
        </div>
      </section>

      {/* Subdomain minisite & sponsored placement explanation */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-[#fff8f8] border border-[#f0d6d6] rounded-xl p-6">
          <h3 className="text-lg font-semibold">Subdomain minisites & Sponsored placement</h3>
          <p className="mt-2 text-sm text-gray-700">
            VIP minisites are served on a secure subdomain (e.g., <span className="font-mono">yourname.expertnear.me</span>).
            We use wildcard DNS and secure certificates so each minisite is fast and SEO friendly.
            <strong className="block mt-2">Sponsored placement</strong> means VIP profiles receive priority placement in category search results and a visible “Featured” badge. Placement is based on paid priority plus relevance — we always surface the most relevant experts first.
          </p>
        </div>
      </section>

      {/* Trials, billing & refunds */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        <h3 className="text-xl font-semibold mb-3">Trials, billing, and refunds</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <p>
            We offer a <strong>30‑day free VIP upgrade</strong> that any Free or Pro user can claim
            from their dashboard. The trial is free — no payment required — and lasts 30 days. At
            the end of the trial your account will revert to your previous tier unless you choose
            to upgrade.
          </p>

          <p>
            For paid subscriptions we support monthly and annual billing. Annual billing is offered
            at a limited‑time discounted rate. We recommend using a local or global payment provider
            that supports subscriptions and clear invoices. If refunds are required, we will handle
            them per our policy and local regulations.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h3 className="text-2xl font-bold mb-6">Frequently asked questions</h3>

        <div className="space-y-4">
          <details className="p-4 border border-gray-100 rounded-lg">
            <summary className="font-medium cursor-pointer">How does the 30‑day VIP upgrade work?</summary>
            <div className="mt-2 text-sm text-gray-700">
              Click the <strong>Claim 30 Days Free Upgrade to VIP</strong> button in your dashboard.
              The trial activates immediately and unlocks VIP features for 30 days. You can upgrade
              to paid VIP at any time during the trial.
            </div>
          </details>

          <details className="p-4 border border-gray-100 rounded-lg">
            <summary className="font-medium cursor-pointer">What is the verified badge?</summary>
            <div className="mt-2 text-sm text-gray-700">
              The verified badge is a trust signal reserved for VIP members. Verification is
              performed by our team and may require business or identity documents. Once verified,
              the badge appears on your profile and in search results.
            </div>
          </details>

          <details className="p-4 border border-gray-100 rounded-lg">
            <summary className="font-medium cursor-pointer">Which CRMs can I connect?</summary>
            <div className="mt-2 text-sm text-gray-700">
              VIP supports outbound webhooks and Zapier/Make integrations immediately. Native OAuth
              connectors for popular CRMs (HubSpot, Pipedrive, Zoho) are planned and will be
              released progressively.
            </div>
          </details>

          <details className="p-4 border border-gray-100 rounded-lg">
            <summary className="font-medium cursor-pointer">Can I get a refund?</summary>
            <div className="mt-2 text-sm text-gray-700">
              We provide a free 30‑day VIP upgrade so you can evaluate premium features without
              payment. Paid refunds will be handled per our refund policy and local regulations.
            </div>
          </details>
        </div>
      </section>

      {/* Call to action */}
      <section className="max-w-6xl mx-auto px-6 py-12 text-center">
        <h3 className="text-xl font-semibold">Ready to grow your business?</h3>
        <p className="mt-2 text-gray-600">Create a free listing and claim your 30‑day VIP upgrade today.</p>

        <div className="mt-6 flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="px-6 py-3 rounded-md bg-[#b84c4c] text-white font-medium hover:bg-[#a43f3f]"
          >
            Create free listing
          </Link>

          <Link
            href="/pricing/claim-trial"
            className="px-6 py-3 rounded-md border border-[#b84c4c] text-[#b84c4c] font-medium hover:bg-[#fff5f5]"
          >
            Claim 30 Days Free Upgrade to VIP
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#f9e5e5]/70 border-t border-[#e0c0c0] py-8 text-center text-sm text-gray-600">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-3">© {new Date().getFullYear()} ExpertNear.Me — All rights reserved.</div>
          <div className="flex items-center justify-center gap-4 text-xs">
            <Link href="/terms" className="text-gray-600 hover:underline">Terms</Link>
            <Link href="/privacy" className="text-gray-600 hover:underline">Privacy</Link>
            <Link href="/contact" className="text-gray-600 hover:underline">Contact</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}