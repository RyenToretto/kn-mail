import type {
  ActiveOrder,
  ShippingMethods,
  PaymentMethods,
} from "~~/types/order";

export const useOrderStore = defineStore("order", () => {
  const api = useApi();
  const loading = ref(false);
  const error = ref<string | null>(null);
  // Status is not wired up yet
  const status = ref<string | null>(null);

  const order = ref<ActiveOrder>(null);
  // TODO: Add logic for multiple coupon codes
  const couponCode = computed(() => order.value?.couponCodes?.[0] ?? null);
  const shippingMethods = ref<ShippingMethods | null>(null);
  const paymentMethods = ref<PaymentMethods | null>(null);

  async function fetchOrder(type: "base" | "detail" = "base"): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const result = await api.getActiveOrder(type === "detail");
      order.value = (result.activeOrder as ActiveOrder) ?? null;
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message || "Failed to fetch order";
      }
    } finally {
      loading.value = false;
    }
  }

  async function addItemToOrder(variantId: string, quantity: number) {
    // TODO: Handle 'partial' status (e.g. show toast if quantity was adjusted)
    loading.value = true;
    error.value = null;

    try {
      const result = await api.addItemToOrder({
        variantId,
        quantity,
      });

      const data = result.addItemToOrder as Record<string, unknown>;
      if (data) {
        const res = useOrderMutation(order, data);
        if (res.status === "error") {
          error.value = res.message;
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message || "Failed to add item to order";
      }
    } finally {
      loading.value = false;
    }
  }

  async function removeItemFromOrder(orderLineId: string): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const result = await api.removeItemFromOrder(orderLineId);

      const data = result.removeOrderLine as Record<string, unknown>;
      if (data) {
        const res = useOrderMutation(order, data);
        if (res.status === "error") {
          error.value = res.message;
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message || "Failed to remove item from order";
      }
    } finally {
      loading.value = false;
    }
  }

  async function adjustOrderLine(
    orderLineId: string,
    quantity: number,
  ): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const result = await api.adjustOrderLine(orderLineId, quantity);

      const data = result.adjustOrderLine as Record<string, unknown>;
      if (data) {
        const res = useOrderMutation(order, data);
        if (res.status === "error") {
          error.value = res.message;
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message || "Failed to adjust order line";
      }
    } finally {
      loading.value = false;
    }
  }

  async function applyCouponCode(couponCode: string): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const result = await api.applyCouponCode(couponCode);

      const data = result.applyCouponCode as Record<string, unknown>;
      if (data) {
        const res = useOrderMutation(order, data);
        if (res.status === "error") {
          error.value = res.message;
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message || "Failed to apply coupon code";
      }
    } finally {
      loading.value = false;
    }
  }

  async function removeCouponCode(): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      if (couponCode.value) {
        const result = await api.removeCouponCode(couponCode.value);

        const data = result.removeCouponCode as Record<string, unknown>;
        if (data) {
          const res = useOrderMutation(order, data);
          if (res.status === "error") {
            error.value = res.message;
          }
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message || "Failed to remove coupon code";
      }
    } finally {
      loading.value = false;
    }
  }

  async function setCustomerForOrder(input: {
    emailAddress: string;
    firstName: string;
    lastName: string;
  }): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const result = await api.setCustomerForOrder(input);
      const data = result.setCustomerForOrder as Record<string, unknown>;
      const res = useOrderMutation(order, data);

      if (res.status === "error") {
        error.value = res.message;
      }
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message || "Failed to set customer for order";
      }
    } finally {
      loading.value = false;
    }
  }

  async function setOrderShippingAddress(input: {
    fullName?: string;
    streetLine1: string;
    streetLine2?: string;
    city?: string;
    postalCode?: string;
    countryCode: string;
  }): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const result = await api.setOrderShippingAddress(input);
      const data = result.setOrderShippingAddress as Record<string, unknown>;
      const res = useOrderMutation(order, data);

      if (res.status === "error") {
        error.value = res.message;
      }
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message || "Failed to set shipping address";
      }
    } finally {
      loading.value = false;
    }
  }

  async function getShippingMethods(): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const result = await api.getShippingMethods();
      shippingMethods.value = (result.eligibleShippingMethods as ShippingMethods) ?? [];
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message || "Failed to fetch shipping methods";
      }
    } finally {
      loading.value = false;
    }
  }

  async function setShippingMethod(shippingMethodId: string): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const result = await api.setShippingMethod(shippingMethodId);

      const data = result.setOrderShippingMethod as Record<string, unknown>;
      const res = useOrderMutation(order, data);
      if (res.status === "error") {
        error.value = res.message;
      }
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message || "Failed to set shipping method";
      }
    } finally {
      loading.value = false;
    }
  }

  async function getPaymentMethods(): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const result = await api.getPaymentMethods();
      paymentMethods.value = (result.eligiblePaymentMethods as PaymentMethods) ?? [];
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message || "Failed to fetch payment methods";
      }
    } finally {
      loading.value = false;
    }
  }

  async function transitionToState(state: string): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const result = await api.transitionToState(state);
      const data = result.transitionOrderToState as Record<string, unknown>;
      const res = useOrderMutation(order, data);
      if (res.status === "error") {
        error.value = res.message;
      }
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message || "Failed to transition order state";
      }
    } finally {
      loading.value = false;
    }
  }

  async function addPaymentToOrder(input: {
    method: string;
    metadata: {
      shouldDecline?: boolean;
      shouldError?: boolean;
      shouldErrorOnSettle?: boolean;
    };
  }): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const result = await api.addPaymentToOrder(input);
      const data = result.addPaymentToOrder as Record<string, unknown>;
      const res = useOrderMutation(order, data);
      if (res.status === "error") {
        error.value = res.message;
      }
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message || "Failed to add payment";
      }
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    error,
    status,
    order,
    shippingMethods,
    paymentMethods,
    fetchOrder,
    addItemToOrder,
    removeItemFromOrder,
    adjustOrderLine,
    applyCouponCode,
    removeCouponCode,
    setCustomerForOrder,
    setOrderShippingAddress,
    getShippingMethods,
    setShippingMethod,
    getPaymentMethods,
    transitionToState,
    addPaymentToOrder,
  };
});
