import { useEffect, useState } from "react";

//const API_URL_SEARCH_EVENTS = process.env.NEXT_PUBLIC_API_URL_SEARCH_EVENTS;
const API_URL_SEARCH_EVENTS = "http://localhost:7071/api/search_events";
const API_URL_GET_FAVORITES = process.env.NEXT_PUBLIC_API_URL_GET_FAVORITES;
const API_URL_GET_CATEGORIES = process.env.NEXT_PUBLIC_API_URL_GET_CATEGORIES;

export function useEventsData(id, keyword, eventTitle) {
  const [favorites, setFavorites] = useState([]);
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    fetch(API_URL_GET_FAVORITES, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
      .then(res => res.json())
      .then(data => setFavorites(Array.isArray(data) ? data : []))
      .catch(() => setFavorites([]));

    fetch(API_URL_SEARCH_EVENTS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword, event_title: eventTitle }),
    })
      .then(res => res.json())
      .then(data => {
        setEvents(Array.isArray(data) ? data : []);
      })
      .catch(err => setError("データ取得エラー: " + err.message));

    fetch(API_URL_GET_CATEGORIES)
      .then(res => res.json())
      .then(data => {
        setCategories(Array.isArray(data) ? data.map(cat => ({ id: cat.category_id, name: cat.category_name })) : []);
      })
      .catch(err => setError("カテゴリー取得エラー: " + err.message));

  }, [id, keyword, eventTitle]);

  return {
    favorites,
    setFavorites,
    events,
    categories,
    error,
    setError,
  };
}