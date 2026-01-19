// GET /api/orders/history - Get order history for current customer
// Query params: take, skip, sort
import { getOrderHistory } from "../../mocks";

export default defineEventHandler((event) => {
  const query = getQuery(event);
  const sessionToken = getHeader(event, "authorization")?.replace("Bearer ", "") || "anonymous";

  const take = Number(query.take) || 10;
  const skip = Number(query.skip) || 0;

  const result = getOrderHistory(sessionToken, { take, skip });

  return {
    activeCustomer: {
      orders: result,
    },
  };
});
