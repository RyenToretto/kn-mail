<script setup lang="ts">
import type { CheckoutState } from "~~/types/general";

const api = useApi();
const { stripePublicKey } = useRuntimeConfig().public;
const colorMode = useColorMode();
const { locale } = useI18n();
const { onLoaded } = useScriptStripe();
const { stripe, elements, paymentElRef, initStripe, submitStripePayment } =
  useStripe();

defineExpose({ submitStripePayment });

const { order } = storeToRefs(useOrderStore());
const orderTotal = computed(() => order.value?.totalWithTax ?? 0);
const checkoutState = useState<CheckoutState>("checkoutState");
const state = checkoutState.value.paymentForm;

watch(
  () => orderTotal.value,
  async (n, o) => {
    if (n !== o) {
      const result = await api.createStripePaymentIntent();
      initStripe(result.createStripePaymentIntent);
    }
  },
);

watch(colorMode, () => {
  elements.value?.update({
    appearance: {
      theme: colorMode.value === "dark" ? "night" : "stripe",
      labels: "floating",
    },
  });
});

onMounted(() => {
  onLoaded(async ({ Stripe }) => {
    stripe.value = Stripe(stripePublicKey, { locale: locale.value });

    if (state.code === "stripe-payment") {
      const result = await api.createStripePaymentIntent();
      initStripe(result.createStripePaymentIntent);
    }
  });
});
</script>

<template>
  <div ref="paymentElRef" />
</template>
