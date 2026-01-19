// GET /api/collections/:slug - Get single collection by slug
import { getCollectionBySlug } from "../../mocks";

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, "slug");

  if (!slug) {
    throw createError({
      statusCode: 400,
      message: "Collection slug is required",
    });
  }

  const collection = getCollectionBySlug(slug);

  if (!collection) {
    throw createError({
      statusCode: 404,
      message: `Collection not found: ${slug}`,
    });
  }

  return {
    collection,
  };
});
