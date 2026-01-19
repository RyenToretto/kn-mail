// DELETE /api/orders/coupon - Remove coupon code
// Body: { couponCode }
import { removeCouponCode } from "../../mocks";

export default defineEventHandler(async (event) => {
  const sessionToken = getHeader(event, "authorization")?.replace("Bearer ", "") || "anonymous";
  const body = await readBody(event);

  if (!body.couponCode) {
    throw createError({
      statusCode: 400,
      message: "couponCode is required",
    });
  }

  const result = removeCouponCode(sessionToken, body.couponCode);

  return {
    removeCouponCode: {
      __typename: "Order",
      ...result.order,
    },
  };
});
