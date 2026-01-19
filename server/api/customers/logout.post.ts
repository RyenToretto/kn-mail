// POST /api/customers/logout - Logout user
import { logoutUser } from "../../mocks";

export default defineEventHandler((event) => {
  const sessionToken = getHeader(event, "authorization")?.replace("Bearer ", "") || "";

  const result = logoutUser(sessionToken);

  return {
    logout: {
      success: result.success,
    },
  };
});
