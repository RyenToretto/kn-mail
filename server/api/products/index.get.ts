// GET /api/products - Get products list with pagination
import { getProducts } from "../../mocks";

export default defineEventHandler((event) => {
  const query = getQuery(event);

  const take = Number(query.take) || 12;
  const skip = Number(query.skip) || 0;

  const result = getProducts(skip, take);

  return {
    products: result,
  };
});
