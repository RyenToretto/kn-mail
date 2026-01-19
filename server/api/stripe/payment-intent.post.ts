// POST /api/stripe/payment-intent - Create Stripe payment intent
import { createStripePaymentIntent } from "../../mocks";

export default defineEventHandler(() => {
  const clientSecret = createStripePaymentIntent();

  return {
    createStripePaymentIntent: clientSecret,
  };
});
