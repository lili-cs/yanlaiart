import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key || key === "sk_test_xxx") {
      throw new Error("Stripe secret key is not configured");
    }
    _stripe = new Stripe(key);
  }
  return _stripe;
}
