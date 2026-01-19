// POST /api/customers/password-reset - Reset password
// Body: { token, password }
import { resetPassword } from "../../mocks";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body.token || !body.password) {
    throw createError({
      statusCode: 400,
      message: "token and password are required",
    });
  }

  const result = resetPassword(body.token, body.password);

  if (!result.success) {
    return {
      resetPassword: {
        __typename: "ErrorResult",
        errorCode: result.errorCode,
        message: result.message,
      },
    };
  }

  return {
    resetPassword: {
      __typename: "CurrentUser",
      ...result.currentUser,
    },
  };
});
