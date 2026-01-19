// POST /api/orders/items - Add item to order
// Body: { variantId, quantity, variantInfo: { name, sku, price, asset? } }
import { addItemToOrder } from "../../mocks";

export default defineEventHandler(async (event) => {
  const sessionToken = getHeader(event, "authorization")?.replace("Bearer ", "") || "anonymous";
  const body = await readBody(event);

  if (!body.variantId || !body.quantity) {
    throw createError({
      statusCode: 400,
      message: "variantId and quantity are required",
    });
  }

  // Default variant info if not provided
  const variantInfo = body.variantInfo || {
    name: "Product Variant",
    sku: "SKU-DEFAULT",
    price: 0,
  };

  const result = addItemToOrder(
    sessionToken,
    body.variantId,
    body.quantity,
    variantInfo
  );

  if (!result.success) {
    return {
      addItemToOrder: {
        __typename: "ErrorResult",
        errorCode: result.errorCode,
        message: result.message,
      },
    };
  }

  return {
    addItemToOrder: {
      __typename: "Order",
      ...result.order,
    },
  };
});
