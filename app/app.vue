<script setup lang="ts">
const api = useApi();
const { t } = useI18n();
const orderStore = useOrderStore();

// Create shared menu collections
const { data: menuCollections } = await useAsyncData(
  "menuCollections",
  () => api.getMenuCollections()
);
useState("menuCollections", () => menuCollections.value);

// Fetch current order on mount
onBeforeMount(async () => {
  await orderStore.fetchOrder();
});

// OgImage
defineOgImageComponent("Frame", {
  title: t("messages.site.title"),
  description: t("messages.site.tagline"),
  // image: "/logo.png",
  // logo: "/logo-full.svg",
});

// SchemaOrg
useSchemaOrg([
  defineWebPage({
    name: t("messages.site.title"),
    description: t("messages.site.tagline"),
  }),
  defineWebSite({
    name: t("messages.site.title"),
    description: t("messages.site.tagline"),
  }),
]);
</script>

<template>
  <NuxtLoadingIndicator />
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<style lang="css" scoped></style>
