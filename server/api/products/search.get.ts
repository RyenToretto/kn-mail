// GET /api/products/search - Search products
// Supports: term, collectionSlug, skip, take
import { searchProducts } from "../../mocks";

export default defineEventHandler((event) => {
  const query = getQuery(event);

  const term = (query.term as string) || "";
  const collectionSlug = query.collectionSlug as string | undefined;
  const skip = Number(query.skip) || 0;
  const take = Number(query.take) || 12;

  const result = searchProducts(term, collectionSlug, skip, take);

  return {
    search: result,
  };
});
