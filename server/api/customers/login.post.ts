// POST /api/customers/login - Login user
// Body: { emailAddress, password, rememberMe }
import { loginUser } from "../../mocks";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body.emailAddress || !body.password) {
    throw createError({
      statusCode: 400,
      message: "emailAddress and password are required",
    });
  }

  const result = loginUser(
    body.emailAddress,
    body.password,
    body.rememberMe ?? true
  );

  if (!result.success) {
    return {
      login: {
        __typename: "ErrorResult",
        errorCode: result.errorCode,
        message: result.message,
      },
    };
  }

  // Set token in response header
  setHeader(event, "vendure-auth-token", result.token);

  return {
    login: {
      __typename: "CurrentUser",
      ...result.currentUser,
    },
    token: result.token,
  };
});
