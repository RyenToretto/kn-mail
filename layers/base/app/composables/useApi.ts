// useApi - REST API composable to replace GraphQL calls

interface ApiOptions {
  headers?: Record<string, string>;
}

// Get auth token from store
function getAuthHeaders(): Record<string, string> {
  const authStore = useAuthStore();
  const headers: Record<string, string> = {};

  if (authStore.session?.token) {
    headers["Authorization"] = `Bearer ${authStore.session.token}`;
  }

  return headers;
}

// Generic fetch wrapper with auth
async function apiFetch<T>(
  url: string,
  options: RequestInit & ApiOptions = {}
): Promise<T> {
  const authHeaders = getAuthHeaders();

  const response = await $fetch<T>(url, {
    ...options,
    headers: {
      ...authHeaders,
      ...options.headers,
    },
  });

  return response;
}

// API methods
export function useApi() {
  return {
    // Collections
    getMenuCollections: () =>
      apiFetch<{ collections: { items: unknown[] } }>("/api/collections"),

    getCollection: (slug: string) =>
      apiFetch<{ collection: unknown }>(`/api/collections/${slug}`),

    // Products
    getProducts: (params?: { skip?: number; take?: number }) =>
      apiFetch<{ products: { items: unknown[]; totalItems: number } }>(
        "/api/products",
        { params }
      ),

    getProductDetail: (slug: string) =>
      apiFetch<{ product: unknown }>(`/api/products/${slug}`),

    searchProducts: (params: {
      term?: string;
      collectionSlug?: string;
      skip?: number;
      take?: number;
    }) =>
      apiFetch<{ search: { items: unknown[]; totalItems: number } }>(
        "/api/products/search",
        { params }
      ),

    getProductVariantStock: (productId: string, variantId: string) =>
      apiFetch<{
        product: { variantList: { items: { stockLevel: string }[] } };
      }>("/api/products/stock", {
        params: { productId, variantId },
      }),

    // Orders
    getActiveOrder: (detail?: boolean) =>
      apiFetch<{ activeOrder: unknown }>("/api/orders/active", {
        params: detail ? { detail: "true" } : undefined,
      }),

    getOrderByCode: (code: string) =>
      apiFetch<{ orderByCode: unknown }>(`/api/orders/${code}`),

    getOrderHistory: (options?: { take?: number; skip?: number }) =>
      apiFetch<{
        activeCustomer: { orders: { items: unknown[]; totalItems: number } };
      }>("/api/orders/history", { params: options }),

    addItemToOrder: (data: {
      variantId: string;
      quantity: number;
      variantInfo?: {
        name: string;
        sku: string;
        price: number;
        asset?: { id: string; preview: string };
      };
    }) =>
      apiFetch<{ addItemToOrder: unknown }>("/api/orders/items", {
        method: "POST",
        body: data,
      }),

    removeItemFromOrder: (orderLineId: string) =>
      apiFetch<{ removeOrderLine: unknown }>("/api/orders/items", {
        method: "DELETE",
        body: { orderLineId },
      }),

    adjustOrderLine: (orderLineId: string, quantity: number) =>
      apiFetch<{ adjustOrderLine: unknown }>("/api/orders/items", {
        method: "PATCH",
        body: { orderLineId, quantity },
      }),

    applyCouponCode: (couponCode: string) =>
      apiFetch<{ applyCouponCode: unknown }>("/api/orders/coupon", {
        method: "POST",
        body: { couponCode },
      }),

    removeCouponCode: (couponCode: string) =>
      apiFetch<{ removeCouponCode: unknown }>("/api/orders/coupon", {
        method: "DELETE",
        body: { couponCode },
      }),

    setCustomerForOrder: (input: {
      emailAddress: string;
      firstName: string;
      lastName: string;
    }) =>
      apiFetch<{ setCustomerForOrder: unknown }>("/api/orders/customer", {
        method: "POST",
        body: input,
      }),

    setOrderShippingAddress: (input: {
      fullName?: string;
      streetLine1: string;
      streetLine2?: string;
      city?: string;
      postalCode?: string;
      countryCode: string;
    }) =>
      apiFetch<{ setOrderShippingAddress: unknown }>(
        "/api/orders/shipping-address",
        {
          method: "POST",
          body: input,
        }
      ),

    setShippingMethod: (shippingMethodId: string) =>
      apiFetch<{ setOrderShippingMethod: unknown }>(
        "/api/orders/shipping-method",
        {
          method: "POST",
          body: { shippingMethodId },
        }
      ),

    transitionToState: (state: string) =>
      apiFetch<{ transitionOrderToState: unknown }>("/api/orders/transition", {
        method: "POST",
        body: { state },
      }),

    addPaymentToOrder: (input: {
      method: string;
      metadata?: Record<string, unknown>;
    }) =>
      apiFetch<{ addPaymentToOrder: unknown }>("/api/orders/payment", {
        method: "POST",
        body: input,
      }),

    setOrderCustomFields: (customFields: Record<string, unknown>) =>
      apiFetch<{ setOrderCustomFields: unknown }>("/api/orders/custom-fields", {
        method: "POST",
        body: { customFields },
      }),

    // Customers
    getActiveCustomer: (detail?: boolean) =>
      apiFetch<{ activeCustomer: unknown }>("/api/customers/active", {
        params: detail ? { detail: "true" } : undefined,
      }),

    getCustomerAddresses: () =>
      apiFetch<{ activeCustomer: { id: string; addresses: unknown[] } }>(
        "/api/customers/addresses"
      ),

    login: (emailAddress: string, password: string, rememberMe = true) =>
      apiFetch<{ login: unknown; token?: string }>("/api/customers/login", {
        method: "POST",
        body: { emailAddress, password, rememberMe },
      }),

    logout: () =>
      apiFetch<{ logout: { success: boolean } }>("/api/customers/logout", {
        method: "POST",
      }),

    register: (input: {
      emailAddress: string;
      firstName: string;
      lastName: string;
      password?: string;
    }) =>
      apiFetch<{ registerCustomerAccount: unknown }>("/api/customers/register", {
        method: "POST",
        body: input,
      }),

    verifyAccount: (token: string, password?: string) =>
      apiFetch<{ verifyCustomerAccount: unknown }>("/api/customers/verify", {
        method: "POST",
        body: { token, password },
      }),

    requestPasswordReset: (emailAddress: string) =>
      apiFetch<{ requestPasswordReset: unknown }>(
        "/api/customers/password-reset-request",
        {
          method: "POST",
          body: { emailAddress },
        }
      ),

    resetPassword: (token: string, password: string) =>
      apiFetch<{ resetPassword: unknown }>("/api/customers/password-reset", {
        method: "POST",
        body: { token, password },
      }),

    // Config
    getShippingMethods: () =>
      apiFetch<{ eligibleShippingMethods: unknown[] }>("/api/shipping-methods"),

    getPaymentMethods: () =>
      apiFetch<{ eligiblePaymentMethods: unknown[] }>("/api/payment-methods"),

    getChannelCountries: () =>
      apiFetch<{
        activeChannel: {
          defaultShippingZone: {
            id: string;
            name: string;
            members: { id: string; code: string; name: string }[];
          };
        };
      }>("/api/countries"),

    createStripePaymentIntent: () =>
      apiFetch<{ createStripePaymentIntent: string }>(
        "/api/stripe/payment-intent",
        {
          method: "POST",
        }
      ),
  };
}

// Async version for SSR-friendly data fetching (similar to useAsyncGql)
export function useAsyncApi<T>(
  fetcher: () => Promise<T>,
  options?: { immediate?: boolean; server?: boolean }
) {
  return useAsyncData(fetcher, {
    immediate: options?.immediate ?? true,
    server: options?.server ?? true,
  });
}
