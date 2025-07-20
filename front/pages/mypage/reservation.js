import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getValidId } from "../../utils/getValidId";

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate());
  const hour = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${year}年${month}月${day}日${hour}時${min}分`;
}

export default function ReservationHistory() {
  const router = useRouter();
  const queryId = router.query.id;
  const id = getValidId();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [alertMsg, setAlertMsg] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  console.log("localStorage id:", id);

  // 履歴取得
  const fetchHistory = () => {
    setLoading(true);
    fetch(`https://0x0-participation-test.azurewebsites.net/api/get_mylist?code=j6Iy8Se_keedcQIBmyZKzXRss7pfBX-kmyk8UNLdjY1MAzFuQzWOaw%3D%3D&id=${id}`)
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
  }, [id]);

  // デザイン付きアラート
  function showCustomAlert(msg) {
    setAlertMsg(msg);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 2500);
  }

  // キャンセル処理
  async function handleCancel(event_id) {
    setCanceling(true);
    try {
      const res = await fetch(`https://0x0-participation-test.azurewebsites.net/api/cancel_participation?code=lg6z2CItkdkWJ01FZGSTMb0W0e7HfGW9hHGRwMsq_bpFAzFuADr_nQ%3D%3D&id=${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id, id })
      });
      if (res.ok) {
        fetchHistory();
        showCustomAlert("キャンセルしました");
        setConfirmId(null);
      } else {
        const msg = await res.text();
        showCustomAlert(msg || "キャンセルに失敗しました");
      }
    } catch {
      showCustomAlert("通信エラーが発生しました");
    }
    setCanceling(false);
  }

  if (loading) return <div className="card" style={{ textAlign: "center" }}>読み込み中...</div>;
  if (!history.length) return <div className="card" style={{ textAlign: "center" }}>参加予約はありません。</div>;

  return (
    <div className="card" style={{ position: "relative" }}>
      <h2 style={{ color: "#7f5af0", marginBottom: "1.5em" }}>予約一覧</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {history
          .filter(item => !item.cancelled_at) // キャンセル済みは非表示
          .map(item => (
            <li key={item.event_id} style={{ marginBottom: "2em", borderBottom: "1px solid #2cb67d40", paddingBottom: "1em" }}>
              <div style={{ fontWeight: "bold", fontSize: "1.1em", color: "#7f5af0", background: "#fff", padding: "0.3em 0.7em", borderRadius: "6px", display: "inline-block" }}>
                イベント名: {item.event_title}
              </div>
              <div style={{ color: "#7f5af0" }}>
                日時: {formatDate(item.event_datetime)}
              </div>
              <div style={{ color: "#2cb67d" }}>
                場所: {item.location}
              </div>
              <div style={{ color: "#e0e7ff" }}>
                作成者: {item.creator}
              </div>
              {item.image && (
                <img src={item.image} alt="イベント画像" style={{ margin: "1em 0", maxWidth: "320px" }} />
              )}
              {confirmId === item.event_id ? (
                <button
                  style={{ marginTop: "0.8em", background: "#f43f5e" }}
                  onClick={() => handleCancel(item.event_id)}
                  disabled={canceling}
                >
                  {canceling ? "キャンセル中..." : "本当にキャンセルする"}
                </button>
              ) : (
                <button
                  style={{ marginTop: "0.8em" }}
                  onClick={() => setConfirmId(item.event_id)}
                  disabled={canceling}
                >
                  参加キャンセル
                </button>
              )}
              {confirmId === item.event_id && (
                <div style={{ color: "#f43f5e", marginTop: "0.5em" }}>
                  キャンセルしてもよろしいですか？
                </div>
              )}
            </li>
          ))}
      </ul>
      {showAlert && (
        <div
          style={{
            position: "fixed",
            top: "40px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "linear-gradient(90deg, #7f5af0 0%, #2cb67d 100%)",
            color: "#fff",
            padding: "1em 2em",
            borderRadius: "12px",
            boxShadow: "0 4px 24px #2cb67d40",
            fontWeight: "bold",
            fontSize: "1.1em",
            zIndex: 9999,
            letterSpacing: "0.05em"
          }}
        >
          {alertMsg}
        </div>
      )}
    </div>
  );
}