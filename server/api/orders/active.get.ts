// GET /api/orders/active - Get active order for current session
// Query params: detail (boolean) - if true, returns full order detail
import { getActiveOrder } from "../../mocks";

export default defineEventHandler((event) => {
  const query = getQuery(event);
  const sessionToken = getHeader(event, "authorization")?.replace("Bearer ", "") || "anonymous";

  const order = getActiveOrder(sessionToken);

  // If order has no items, return null (simulating no active order)
  if (order.lines.length === 0 && order.state === "AddingItems") {
    return {
      activeOrder: null,
    };
  }

  return {
    activeOrder: order,
  };
});
