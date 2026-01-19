// POST /api/orders/transition - Transition order to a new state
// Body: { state }
import { transitionToState } from "../../mocks";

export default defineEventHandler(async (event) => {
  const sessionToken = getHeader(event, "authorization")?.replace("Bearer ", "") || "anonymous";
  const body = await readBody(event);

  if (!body.state) {
    throw createError({
      statusCode: 400,
      message: "state is required",
    });
  }

  const result = transitionToState(sessionToken, body.state);

  if (!result.success) {
    return {
      transitionOrderToState: {
        __typename: "OrderStateTransitionError",
        errorCode: result.errorCode,
        message: result.message,
        transitionError: result.transitionError,
        fromState: result.fromState,
        toState: result.toState,
      },
    };
  }

  return {
    transitionOrderToState: {
      __typename: "Order",
      ...result.order,
    },
  };
});
