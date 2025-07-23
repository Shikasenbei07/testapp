import { useEffect, useState } from "react";

const API_URL_GET_SELF_CREATED_EVENTS = process.env.NEXT_PUBLIC_API_URL_GET_SELF_CREATED_EVENTS;

export function useSelfCreatedEvents(userId) {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;
    fetch(`${API_URL_GET_SELF_CREATED_EVENTS}&user_id=${userId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`取得失敗: ${res.status}`);
        }
        return res.json();
      })
      .then(setEvents)
      .catch((err) => setError("イベント取得エラー: " + err.message));
  }, [userId]);

  return { events, error };
}