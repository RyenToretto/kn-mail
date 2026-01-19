// GET /api/products/stock - Get product variant stock level
// Query params: productId, variantId
import { getVariantStock } from "../../mocks";

export default defineEventHandler((event) => {
  const query = getQuery(event);

  const productId = query.productId as string;
  const variantId = query.variantId as string;

  if (!productId || !variantId) {
    throw createError({
      statusCode: 400,
      message: "productId and variantId are required",
    });
  }

  const stockLevel = getVariantStock(productId, variantId);

  if (stockLevel === null) {
    throw createError({
      statusCode: 404,
      message: "Product or variant not found",
    });
  }

  return {
    product: {
      variantList: {
        items: [{ stockLevel }],
      },
    },
  };
});
