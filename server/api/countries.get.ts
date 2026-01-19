// GET /api/countries - Get channel countries
import { getActiveChannel } from "../mocks";

export default defineEventHandler(() => {
  const channel = getActiveChannel();

  return {
    activeChannel: channel,
  };
});
