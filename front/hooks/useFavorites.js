import { getValidId } from "../utils/getValidId";
import { useEffect, useState } from "react";

const API_URL_GET_FAVORITES = 'https://0x0-favorite.azurewebsites.net/api/get_favorites?code=BnxJf-wdwWAFaTkmuqCTkHJDwdzRdwq2RZxdE0soHJPGAzFugW7cOA%3D%3D';

export function useFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = getValidId();
    if (!userId) {
      setLoading(false);
      return;
    }
    fetch(`${API_URL_GET_FAVORITES}&id=${encodeURIComponent(userId)}`)
      .then(res => res.json())
      .then(data => {
        setFavorites(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { favorites, setFavorites, loading };
}