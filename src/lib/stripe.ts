import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.warn(
    'WARNING: STRIPE_SECRET_KEY is missing from environment variables. ' +
    'Stripe Checkout will fail until STRIPE_SECRET_KEY is set in .env.local'
  );
}

export const stripe = new Stripe(stripeSecretKey || 'sk_test_placeholder', {
  apiVersion: '2025-02-24.acacia' as any,
  typescript: true,
});
