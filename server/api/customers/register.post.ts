// POST /api/customers/register - Register new customer
// Body: { emailAddress, firstName, lastName, password? }
import { registerCustomer } from "../../mocks";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body.emailAddress || !body.firstName || !body.lastName) {
    throw createError({
      statusCode: 400,
      message: "emailAddress, firstName, and lastName are required",
    });
  }

  const result = registerCustomer({
    emailAddress: body.emailAddress,
    firstName: body.firstName,
    lastName: body.lastName,
    password: body.password,
  });

  if (!result.success) {
    return {
      registerCustomerAccount: {
        __typename: "ErrorResult",
        errorCode: result.errorCode,
        message: result.message,
      },
    };
  }

  return {
    registerCustomerAccount: {
      __typename: "Success",
      success: true,
    },
  };
});
