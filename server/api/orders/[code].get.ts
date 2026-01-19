// GET /api/orders/:code - Get order by code
import { getOrderByCode } from "../../mocks";

export default defineEventHandler((event) => {
  const code = getRouterParam(event, "code");

  if (!code) {
    throw createError({
      statusCode: 400,
      message: "Order code is required",
    });
  }

  const order = getOrderByCode(code);

  if (!order) {
    throw createError({
      statusCode: 404,
      message: `Order not found: ${code}`,
    });
  }

  return {
    orderByCode: order,
  };
});
