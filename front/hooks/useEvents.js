import { useState, useEffect } from "react";

const isLocal = process.env.NEXT_PUBLIC_IS_LOCAL === "true";
const API_URL_GET_EVENT_DETAIL = process.env.NEXT_PUBLIC_API_URL_GET_EVENT_DETAIL;

export function useEvents(eventId) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!eventId) return;

    const fetchEvents = async () => {
      setLoading(true);
      setError("");

      try {
        const url = isLocal
          ? `${API_URL_GET_EVENT_DETAIL}?event_id=${eventId}`
          : `${API_URL_GET_EVENT_DETAIL}&event_id=${eventId}`;
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setEvent(data);
      } catch (e) {
        console.error('fetchEvents error:', e);
        setError("イベントの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [eventId]);

  return { event, loading, error };
}