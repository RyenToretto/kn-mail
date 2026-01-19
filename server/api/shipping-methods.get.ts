// GET /api/shipping-methods - Get eligible shipping methods
import { getEligibleShippingMethods } from "../mocks";

export default defineEventHandler(() => {
  const methods = getEligibleShippingMethods();

  return {
    eligibleShippingMethods: methods,
  };
});
