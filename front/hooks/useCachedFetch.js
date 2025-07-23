import { useState, useEffect } from "react";

export function useCachedFetch(key, url, mapFn) {
  const [data, setData] = useState([]);
  useEffect(() => {
    if (!url) return;
    if (key === "categories" || key === "keywords") {
      localStorage.removeItem(key);
    }
    fetch(url)
      .then(res => res.json())
      .then(json => {
        const mapped = mapFn ? json.map(mapFn) : json;
        setData(mapped);
        if (key === "categories" || key === "keywords") {
          localStorage.setItem(key, JSON.stringify(mapped));
        }
      });
  }, [key, url]);
  return data;
}