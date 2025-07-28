import { useEffect, useState } from "react";
import { getValidId } from "../utils/getValidId";

const API_URL = "https://0x0-participation-test.azurewebsites.net/api/reservation-history?code=exW-o4MDMd1st0v3s80m78npZI9eFDO5oC0USpOh-_qlAzFuCQyxhQ%3D%3D";

export function useReservationList() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = getValidId();

  const fetchHistory = () => {
    setLoading(true);
    fetch(`${API_URL}&id=${userId}`)
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