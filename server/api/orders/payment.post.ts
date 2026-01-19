// POST /api/orders/payment - Add payment to order
// Body: { method, metadata? }
import { addPaymentToOrder } from "../../mocks";

export default defineEventHandler(async (event) => {
  const sessionToken = getHeader(event, "authorization")?.replace("Bearer ", "") || "anonymous";
  const body = await readBody(event);

  if (!body.method) {
    throw createError({
      statusCode: 400,
      message: "method is required",
    });
  }

  const result = addPaymentToOrder(sessionToken, {
    method: body.method,
    metadata: body.metadata,
  });

  if (!result.success) {
    return {
      addPaymentToOrder: {
        __typename: "ErrorResult",
        errorCode: result.errorCode,
        message: result.message,
      },
    };
  }

  return {
    addPaymentToOrder: {
      __typename: "Order",
      ...result.order,
    },
  };
});
