// GET /api/collections - Get menu collections (top-level with children)
import { getMenuCollections } from "../../mocks";

export default defineEventHandler(() => {
  const collections = getMenuCollections();

  return {
    collections: {
      items: collections,
    },
  };
});
