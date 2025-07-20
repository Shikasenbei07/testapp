import { useCachedFetch } from "./useCachedFetch";

const API_URL_GET_KEYWORDS = process.env.NEXT_PUBLIC_API_URL_GET_KEYWORDS;

export function useKeywords() {
  return useCachedFetch(
    "keywords",
    API_URL_GET_KEYWORDS,
    k => ({ value: String(k.keyword_id), label: k.keyword_name })
  );
}
