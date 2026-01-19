// POST /api/orders/custom-fields - Set order custom fields
// Body: { customFields }
import { setOrderCustomFields } from "../../mocks";

export default defineEventHandler(async (event) => {
  const sessionToken = getHeader(event, "authorization")?.replace("Bearer ", "") || "anonymous";
  const body = await readBody(event);

  const result = setOrderCustomFields(sessionToken, {
    customFields: body.customFields || {},
  });

  return {
    setOrderCustomFields: {
      __typename: "Order",
      ...result.order,
    },
  };
});
