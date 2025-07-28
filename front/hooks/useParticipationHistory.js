import { useEffect, useState } from "react";
import { getValidId } from "../utils/getValidId";

const API_URL = "https://0x0-participation-test.azurewebsites.net/api/participation-history?code=5jxM5LSzZvvU3zzoZbsQGr7w97h9YqQh1Dl_fhlictTuAzFuG_dOjQ%3D%3D";

export function useParticipationHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ id: getValidId() }) // 固定のユーザーID
    })
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