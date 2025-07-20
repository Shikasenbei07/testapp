import { useCachedFetch } from "./useCachedFetch";

const API_URL_GET_CATEGORIES = process.env.NEXT_PUBLIC_API_URL_GET_CATEGORIES

export function useCategories() {
  return useCachedFetch(
    "categories",
    API_URL_GET_CATEGORIES,
    c => ({ value: String(c.category_id), label: c.category_name })
  );
}
