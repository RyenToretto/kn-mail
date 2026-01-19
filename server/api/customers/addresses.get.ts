// GET /api/customers/addresses - Get customer addresses
import { getCustomerAddresses } from "../../mocks";

export default defineEventHandler((event) => {
  const sessionToken = getHeader(event, "authorization")?.replace("Bearer ", "") || "";

  if (!sessionToken) {
    return {
      activeCustomer: null,
    };
  }

  const addresses = getCustomerAddresses(sessionToken);

  return {
    activeCustomer: {
      id: "active",
      addresses,
    },
  };
});
