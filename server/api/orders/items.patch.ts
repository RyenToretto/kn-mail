// PATCH /api/orders/items - Adjust order line quantity
// Body: { orderLineId, quantity }
import { adjustOrderLine } from "../../mocks";

export default defineEventHandler(async (event) => {
  const sessionToken = getHeader(event, "authorization")?.replace("Bearer ", "") || "anonymous";
  const body = await readBody(event);

  if (!body.orderLineId || body.quantity === undefined) {
    throw createError({
      statusCode: 400,
      message: "orderLineId and quantity are required",
    });
  }

  const result = adjustOrderLine(sessionToken, body.orderLineId, body.quantity);

  if (!result.success) {
    return {
      adjustOrderLine: {
        __typename: "ErrorResult",
        errorCode: result.errorCode,
        message: result.message,
      },
    };
  }

  return {
    adjustOrderLine: {
      __typename: "Order",
      ...result.order,
    },
  };
});
