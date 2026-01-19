// POST /api/customers/password-reset-request - Request password reset
// Body: { emailAddress }
import { requestPasswordReset } from "../../mocks";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body.emailAddress) {
    throw createError({
      statusCode: 400,
      message: "emailAddress is required",
    });
  }

  const result = requestPasswordReset(body.emailAddress);

  return {
    requestPasswordReset: {
      __typename: "Success",
      success: result.success,
    },
  };
});
