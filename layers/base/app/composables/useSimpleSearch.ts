import { refDebounced } from "@vueuse/core";
import type { SearchResult } from "~~/types/product";

export function useSimpleSearch() {
  const api = useApi();
  const term = ref("");
  const debouncedTerm = refDebounced(term, 1000, { maxWait: 5000 });
  const pending = ref(false);
  const error = ref<Error | null>(null);
  const data = ref<{ search: { items: unknown[] } } | null>(null);

  async function execute() {
    if (debouncedTerm.value.length < 2) return;

    pending.value = true;
    error.value = null;

    try {
      const result = await api.searchProducts({
        term: debouncedTerm.value,
        take: 12,
      });
      data.value = result;
    } catch (err) {
      error.value = err as Error;
    } finally {
      pending.value = false;
    }
  }

  watch(debouncedTerm, (val) => {
    if (val.length >= 2) execute();
  });

  const results: ComputedRef<SearchResult> = computed(
    () => (data.value?.search?.items as SearchResult) ?? [],
  );

  return {
    term,
    results,
    pending,
    error,
  };
}
