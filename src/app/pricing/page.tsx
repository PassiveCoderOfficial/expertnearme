import type { Metadata } from 'next';
import PricingTable from '@/components/PricingTable';

export const metadata: Metadata = {
  title: 'Pricing — ExpertNear.Me',
  description:
    'Secure your Founding Expert spot before ExpertNear.Me launches. Lifetime deal at $999 — limited to 500 experts, expires August 15, 2026.',
};

export default function PricingPage() {
  return <PricingTable />;
}
