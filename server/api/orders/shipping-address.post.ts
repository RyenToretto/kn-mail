// POST /api/orders/shipping-address - Set order shipping address
// Body: { fullName?, streetLine1, streetLine2?, city?, postalCode?, countryCode }
import { setOrderShippingAddress } from "../../mocks";

export default defineEventHandler(async (event) => {
  const sessionToken = getHeader(event, "authorization")?.replace("Bearer ", "") || "anonymous";
  const body = await readBody(event);

  if (!body.streetLine1 || !body.countryCode) {
    throw createError({
      statusCode: 400,
      message: "streetLine1 and countryCode are required",
    });
  }

  const result = setOrderShippingAddress(sessionToken, {
    fullName: body.fullName,
    streetLine1: body.streetLine1,
    streetLine2: body.streetLine2,
    city: body.city,
    postalCode: body.postalCode,
    countryCode: body.countryCode,
  });

  if (!result.success) {
    return {
      setOrderShippingAddress: {
        __typename: "ErrorResult",
        errorCode: result.errorCode,
        message: result.message,
      },
    };
  }

  return {
    setOrderShippingAddress: {
      __typename: "Order",
      ...result.order,
    },
  };
});
