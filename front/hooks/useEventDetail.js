import { useEffect, useState } from "react";

const API_URL_GET_EVENT_DETAIL = process.env.NEXT_PUBLIC_API_URL_GET_EVENT_DETAIL;

export function useEventDetail(event_id) {
  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!event_id) return;
    fetch(`${API_URL_GET_EVENT_DETAIL}&event_id=${event_id}`)
      .then(res => res.json())
      .then(data => setEvent(data))
      .catch(err => setError('データ取得エラー: ' + err.message));
  }, [event_id]);

  return { event, error };
}