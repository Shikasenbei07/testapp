import { useEffect, useState } from "react";
import { getValidId } from "../utils/getValidId";

const API_URL_GET_DRAFT = process.env.NEXT_PUBLIC_API_URL_GET_DRAFT;

export function useDraftEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const userId = getValidId();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setEvents([]);
      return;
    }
    setLoading(true);
    fetch(API_URL_GET_DRAFT + `&id=${encodeURIComponent(userId)}`, {
      method: "GET",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch drafts");
        return res.json();
      })
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch(() => {
        setEvents([]);
        setError("下書きイベントの取得に失敗しました");
        setLoading(false);
      });
  }, [userId]);

  return { events, loading, error };
}