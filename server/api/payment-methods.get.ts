// GET /api/payment-methods - Get eligible payment methods
import { getEligiblePaymentMethods } from "../mocks";

export default defineEventHandler(() => {
  const methods = getEligiblePaymentMethods();

  return {
    eligiblePaymentMethods: methods,
  };
});
