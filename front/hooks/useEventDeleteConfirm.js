import { useState, useEffect, useCallback } from "react";
import { getValidId } from "../utils/getValidId";

const API_URL_GET_EVENT_DETAIL = process.env.NEXT_PUBLIC_API_URL_GET_EVENT_DETAIL;
const API_URL_DELETE_EVENT = process.env.NEXT_PUBLIC_API_URL_DELETE_EVENT;

export function useEventDeleteConfirm(router) {
  const [eventId, setEventId] = useState("");
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!router.isReady) return;
    const { event_id } = router.query;
    setEventId(event_id);
    if (event_id) {
      fetch(API_URL_GET_EVENT_DETAIL + `&event_id=${event_id}`)
        .then(res => res.json())
        .then(data => setEventData(data))
        .catch(() => setEventData(null));
    }
  }, [router.isReady, router.query]);

  const handleDelete = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const url = API_URL_DELETE_EVENT.replace("%7Bevent_id%7D", eventId);
      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ creator: getValidId() })
      });
      if (res.ok) {
        router.push("/event/delete/complete");
      } else {
        let err;
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          err = await res.json();
        } else {
          err = { error: await res.text() };
        }
        setError(err.error || "削除に失敗しました");
      }
    } catch (e) {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, [eventId, router]);

  return {
    eventData,
    loading,
    error,
    handleDelete,
  };
}