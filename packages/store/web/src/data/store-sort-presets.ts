import type { StoreSortBy, StoreSortOrder } from "./store.types";

export type StoreSortPreset = {
  value: string;
  label: string;
  sortBy: StoreSortBy;
  sortOrder: StoreSortOrder;
};

export const STORE_SORT_PRESETS = [
  { value: "", label: "Relevância", sortBy: "", sortOrder: "" },
  { value: "date:desc", label: "Mais recentes", sortBy: "date", sortOrder: "desc" },
  { value: "price:asc", label: "Menor preço", sortBy: "price", sortOrder: "asc" },
  { value: "price:desc", label: "Maior preço", sortBy: "price", sortOrder: "desc" },
  { value: "rating:desc", label: "Melhor avaliação", sortBy: "rating", sortOrder: "desc" },
  { value: "name:asc", label: "Nome A-Z", sortBy: "name", sortOrder: "asc" },
] as const satisfies readonly StoreSortPreset[];
