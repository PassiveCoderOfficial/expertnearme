import {
  lemonSqueezySetup,
  createCheckout,
} from '@lemonsqueezy/lemonsqueezy.js';

export function setupLemonSqueezy() {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  if (!apiKey) throw new Error('LEMONSQUEEZY_API_KEY is not set');
  lemonSqueezySetup({ apiKey });
}

export interface CheckoutOptions {
  email?: string;
  expertName?: string;
  redirectUrl?: string;
}

export async function createLifetimeCheckout(options: CheckoutOptions = {}) {
  setupLemonSqueezy();

  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  const variantId = process.env.LEMONSQUEEZY_LIFETIME_VARIANT_ID;

  if (!storeId || !variantId) {
    throw new Error('LEMONSQUEEZY_STORE_ID or LEMONSQUEEZY_LIFETIME_VARIANT_ID is not set');
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://expertnear.me';

  const { data, error } = await createCheckout(storeId, variantId, {
    checkoutOptions: {
      embed: false,
      media: true,
      logo: true,
    },
    checkoutData: {
      email: options.email,
      custom: {
        expert_name: options.expertName ?? '',
      },
    },
    productOptions: {
      name: 'Founding Expert — Lifetime Deal',
      description: 'Lifetime access to ExpertNear.Me Pro features. Founding Expert badge, permanent Hall of Fame listing, and all future features included forever.',
      redirectUrl: options.redirectUrl ?? `${baseUrl}/create-expert-account?founding=1`,
      receiptButtonText: 'Set Up Your Expert Profile',
      receiptLinkUrl: `${baseUrl}/create-expert-account?founding=1`,
    },
  });

  if (error) throw new Error(error.message);
  return data?.data.attributes.url as string;
}
