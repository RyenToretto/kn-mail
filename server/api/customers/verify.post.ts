// POST /api/customers/verify - Verify customer account
// Body: { token, password? }
import { verifyCustomerAccount } from "../../mocks";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body.token) {
    throw createError({
      statusCode: 400,
      message: "token is required",
    });
  }

  const result = verifyCustomerAccount(body.token, body.password);

  if (!result.success) {
    return {
      verifyCustomerAccount: {
        __typename: "ErrorResult",
        errorCode: result.errorCode,
        message: result.message,
      },
    };
  }

  return {
    verifyCustomerAccount: {
      __typename: "CurrentUser",
      ...result.currentUser,
    },
  };
});
