import type { CheckoutState } from "~~/types/general";

export function useCheckout() {
  const api = useApi();
  const orderStore = useOrderStore();
  const checkoutState = useState<CheckoutState>("checkoutState");

  async function recalcShipping() {
    await orderStore.setOrderShippingAddress({
      fullName: `${checkoutState.value.addressForm.firstName} ${checkoutState.value.addressForm.lastName}`,
      streetLine1: checkoutState.value.addressForm.streetLine1,
      city: checkoutState.value.addressForm.city,
      postalCode: checkoutState.value.addressForm.postalCode,
      countryCode: checkoutState.value.addressForm.countryCode,
    });
  }

  watch(
    () => checkoutState.value.addressForm.postalCode,
    async (n, o) => {
      if (n !== o) await recalcShipping();
    },
  );

  watch(
    () => checkoutState.value.shippingForm.shippingMethodId,
    async (n, o) => {
      if (n !== o) await recalcShipping();
    },
  );

  watch(
    () => checkoutState.value.paymentForm.code,
    async (n, o) => {
      if (n && n !== o) {
        await api.setOrderCustomFields({
          paymentProvider: n,
        });

        await recalcShipping();
      }
    },
  );
}
