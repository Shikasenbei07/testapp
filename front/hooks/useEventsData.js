import { useEffect, useState } from "react";

const API_URL_SEARCH_EVENTS = process.env.NEXT_PUBLIC_API_URL_SEARCH_EVENTS;
const API_URL_GET_FAVORITES = process.env.NEXT_PUBLIC_API_URL_GET_FAVORITES;
const API_URL_GET_CATEGORIES = process.env.NEXT_PUBLIC_API_URL_GET_CATEGORIES;

export function useEventsData(id, keyword, eventTitle) {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    // イベント一覧取得
    const fetchEvents = async () => {
      try {
        const res = await fetch(API_URL_SEARCH_EVENTS, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keyword, event_title: eventTitle }),
        });
        if (!res.ok) throw new Error("イベント取得失敗");
        const data = await res.json();
        // keywordsが文字列配列の場合はオブジェクト配列に変換
        const normalized = data.map(ev => ({
          ...ev,
          keywords: Array.isArray(ev.keywords)
            ? ev.keywords.map(k =>
                typeof k === "string" ? { keyword_name: k } : k
              )
            : [],
        }));
        setEvents(normalized);
      } catch (e) {
        setError("イベント取得エラー");
      }
    };
    fetchEvents();
  }, [keyword, eventTitle]);

  useEffect(() => {
    // カテゴリ一覧取得
    const fetchCategories = async () => {
      try {
        const res = await fetch(API_URL_GET_CATEGORIES);
        if (!res.ok) throw new Error("カテゴリ取得失敗");
        const data = await res.json();
        setCategories(data);
      } catch (e) {
        setError("カテゴリ取得エラー");
      }
    };
    fetchCategories();
  }, []);

  return {
    events,
    categories,
    favorites,
    setFavorites,
    error,
    setError,
  };
}