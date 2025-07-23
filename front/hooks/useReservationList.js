import { useEffect, useState } from "react";
import { getValidId } from "../utils/getValidId";

const API_URL = "https://0x0-participation-d7fqb7h3dpcqcxek.japaneast-01.azurewebsites.net/api/reservation-history?code=62ynEBx_jbHKALdJRcPtSf-Hral22ROdaZFZeR6DVf0bAzFuZZI-Rw%3D%3D";

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