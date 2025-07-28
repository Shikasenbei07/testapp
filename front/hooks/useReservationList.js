import { useEffect, useState } from "react";
import { getValidId } from "../utils/getValidId";

const API_URL_RESERVATION_HISTORY = process.env.NEXT_PUBLIC_API_URL_RESERVATION_HISTORY;

export function useReservationList() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = getValidId();

  const fetchHistory = () => {
    setLoading(true);
    fetch(API_URL_RESERVATION_HISTORY, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: userId }),
    }
    )
      .then(res => {
        if (!res.ok) throw new Error("履歴取得失敗");
        return res.json();
      })
      .then(data => {
        setHistory(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line
  }, []);

  return { history, setHistory, loading, fetchHistory, userId };
}