// GET /api/products/:slug - Get product detail by slug
import { getProductBySlug } from "../../mocks";

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, "slug");

  if (!slug) {
    throw createError({
      statusCode: 400,
      message: "Product slug is required",
    });
  }

  const product = getProductBySlug(slug);

  if (!product) {
    throw createError({
      statusCode: 404,
      message: `Product not found: ${slug}`,
    });
  }

  return {
    product,
  };
});
