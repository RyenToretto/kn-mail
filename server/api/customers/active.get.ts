// GET /api/customers/active - Get active customer
// Query params: detail (boolean) - if true, returns full customer detail
import { getActiveCustomer } from "../../mocks";

export default defineEventHandler((event) => {
  const sessionToken = getHeader(event, "authorization")?.replace("Bearer ", "") || "";

  if (!sessionToken) {
    return {
      activeCustomer: null,
    };
  }

  const customer = getActiveCustomer(sessionToken);

  return {
    activeCustomer: customer,
  };
});
