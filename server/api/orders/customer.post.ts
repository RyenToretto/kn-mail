// POST /api/orders/customer - Set customer for order (guest checkout)
// Body: { emailAddress, firstName, lastName }
import { setCustomerForOrder } from "../../mocks";

export default defineEventHandler(async (event) => {
  const sessionToken = getHeader(event, "authorization")?.replace("Bearer ", "") || "anonymous";
  const body = await readBody(event);

  if (!body.emailAddress || !body.firstName || !body.lastName) {
    throw createError({
      statusCode: 400,
      message: "emailAddress, firstName, and lastName are required",
    });
  }

  const result = setCustomerForOrder(sessionToken, {
    emailAddress: body.emailAddress,
    firstName: body.firstName,
    lastName: body.lastName,
  });

  if (!result.success) {
    return {
      setCustomerForOrder: {
        __typename: "ErrorResult",
        errorCode: result.errorCode,
        message: result.message,
      },
    };
  }

  return {
    setCustomerForOrder: {
      __typename: "Order",
      ...result.order,
    },
  };
});
