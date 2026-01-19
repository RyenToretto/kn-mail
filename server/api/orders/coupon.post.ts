// POST /api/orders/coupon - Apply coupon code
// Body: { couponCode }
import { applyCouponCode } from "../../mocks";

export default defineEventHandler(async (event) => {
  const sessionToken = getHeader(event, "authorization")?.replace("Bearer ", "") || "anonymous";
  const body = await readBody(event);

  if (!body.couponCode) {
    throw createError({
      statusCode: 400,
      message: "couponCode is required",
    });
  }

  const result = applyCouponCode(sessionToken, body.couponCode);

  if (!result.success) {
    return {
      applyCouponCode: {
        __typename: "ErrorResult",
        errorCode: result.errorCode,
        message: result.message,
      },
    };
  }

  return {
    applyCouponCode: {
      __typename: "Order",
      ...result.order,
    },
  };
});
