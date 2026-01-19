// POST /api/orders/shipping-method - Set order shipping method
// Body: { shippingMethodId }
import { setShippingMethod } from "../../mocks";

export default defineEventHandler(async (event) => {
  const sessionToken = getHeader(event, "authorization")?.replace("Bearer ", "") || "anonymous";
  const body = await readBody(event);

  if (!body.shippingMethodId) {
    throw createError({
      statusCode: 400,
      message: "shippingMethodId is required",
    });
  }

  const result = setShippingMethod(sessionToken, body.shippingMethodId);

  if (!result.success) {
    return {
      setOrderShippingMethod: {
        __typename: "ErrorResult",
        errorCode: result.errorCode,
        message: result.message,
      },
    };
  }

  return {
    setOrderShippingMethod: {
      __typename: "Order",
      ...result.order,
    },
  };
});
