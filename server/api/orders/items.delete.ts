// DELETE /api/orders/items - Remove item from order
// Body: { orderLineId }
import { removeItemFromOrder } from "../../mocks";

export default defineEventHandler(async (event) => {
  const sessionToken = getHeader(event, "authorization")?.replace("Bearer ", "") || "anonymous";
  const body = await readBody(event);

  if (!body.orderLineId) {
    throw createError({
      statusCode: 400,
      message: "orderLineId is required",
    });
  }

  const result = removeItemFromOrder(sessionToken, body.orderLineId);

  if (!result.success) {
    return {
      removeOrderLine: {
        __typename: "ErrorResult",
        errorCode: result.errorCode,
        message: result.message,
      },
    };
  }

  return {
    removeOrderLine: {
      __typename: "Order",
      ...result.order,
    },
  };
});
