import { useEffect, useState } from "react";

const API_URL = "https://0x0-event-registration-history-cxhcdpauc4b5a9e7.japaneast-01.azurewebsites.net/api/reservation-detail?code=3zMxVWqQvkOGwSYU9lUIemow2Tf52EWlB5kJm6gMO1u0AzFuRjFgfg%3D%3D";

export function useReservationHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(API_URL)
      .then(res => {
        if (!res.ok) throw new Error("データ取得に失敗しました");
        return res.json();
      })
      .then(data => {
        setHistory(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { history, setHistory, loading, error };
}