import { useEffect, useState } from "react";

export function useCachedFetch(key, url, mapFn) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      // 1. ローカルストレージから取得
      const cached = localStorage.getItem(key);
      if (cached) {
        setData(JSON.parse(cached));
        return;
      }

      // 2. APIフェッチ
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const json = await res.json();
        const raw = json.data ?? json;
        const mapped = Array.isArray(raw) ? (mapFn ? raw.map(mapFn) : raw) : raw;

        if (isMounted) {
          setData(mapped);
          localStorage.setItem(key, JSON.stringify(mapped));
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      }
    };

    load();
    return () => { isMounted = false };
  }, [key, url, mapFn]);

  return { data, error };
}
