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

  const userId = getValidId();

  // 履歴取得
  const fetchHistory = () => {
    setLoading(true);
    fetch(
      `https://0x0-participation-d7fqb7h3dpcqcxek.japaneast-01.azurewebsites.net/api/reservation-history?code=62ynEBx_jbHKALdJRcPtSf-Hral22ROdaZFZeR6DVf0bAzFuZZI-Rw%3D%3D&id=${userId}`
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
        body: JSON.stringify({ event_id, user_id: userId })
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
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "linear-gradient(120deg, #e0e7ef 0%, #c7d2fe 60%, #a5b4fc 100%)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        fontFamily: "'Montserrat', 'Noto Sans JP', 'Helvetica Neue', Arial, 'メイリオ', sans-serif",
        overflowX: "hidden"
      }}
    >
      <div
        className="card"
        style={{
          position: "relative",
          maxWidth: 1000, // すこしだけ狭く
          width: "92vw",
          margin: "48px auto",
          background: "#fff",
          borderRadius: 22,
          boxShadow: "0 8px 32px #b4b4d880, 0 2px 8px #c7d2fe80",
          padding: "56px 40px 48px 40px",
          color: "#23263a",
          fontFamily: "'Montserrat', 'Noto Sans JP', 'Helvetica Neue', Arial, 'メイリオ', sans-serif",
          border: "2.5px solid #e0e7ef",
          overflow: "auto",
          textAlign: "center"
        }}
      >
        <h2
          style={{
            color: "#5a5af0",
            marginBottom: "2.5em",
            fontWeight: 900,
            fontSize: "2.3em",
            textAlign: "center",
            letterSpacing: "0.10em",
            fontFamily: "'Bebas Neue', 'Montserrat', 'Noto Sans JP', 'Helvetica Neue', Arial, 'メイリオ', sans-serif",
            textShadow: "0 4px 16px #b4b4d850, 0 1px 0 #fff",
            borderBottom: "3px solid #5a5af0",
            paddingBottom: 14,
            textTransform: "uppercase"
          }}
        >
          予約一覧
        </h2>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "2em"
          }}
        >
          {history
            .filter(item => !item.cancelled_at)
            .map(item => (
              <li
                key={item.event_id}
                style={{
                  flex: "0 1 calc(50% - 2em)", // 2列
                  margin: "0 0 2.5em 0",
                  borderBottom: "1.5px solid #e0e7ef",
                  padding: "2.2em 1.5em 2em 1.5em",
                  borderRadius: "16px",
                  boxShadow: "0 2px 16px #b4b4d820",
                  background: "#f8faff",
                  transition: "box-shadow 0.2s, transform 0.2s",
                  position: "relative",
                  maxWidth: 480,
                  minWidth: 320,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.7em"
                }}
              >
                <div
                  style={{
                    fontWeight: 900,
                    fontSize: "1.25em",
                    color: "#5a5af0",
                    background: "#fff",
                    padding: "0.5em 1.4em",
                    borderRadius: "10px",
                    display: "inline-block",
                    letterSpacing: "0.06em",
                    marginBottom: "0.4em",
                    boxShadow: "0 2px 8px #b4b4d820",
                    textAlign: "center"
                  }}
                >
                  イベント名: {item.event_title}
                </div>
                <div style={{ color: "#5a5af0", fontWeight: 700, margin: "0.2em 0", textAlign: "center", fontSize: "1.08em" }}>
                  日時: {formatDate(item.event_datetime)}
                </div>
                <div style={{ color: "#2cb67d", fontWeight: 700, margin: "0.2em 0", textAlign: "center", fontSize: "1.08em" }}>
                  場所: {item.location}
                </div>
                <div style={{ color: "#7f5af0", margin: "0.2em 0", textAlign: "center", fontWeight: 600 }}>
                  作成者: {item.creator}
                </div>
                {item.image && (
                  <img
                    src={item.image}
                    alt="イベント画像"
                    style={{
                      margin: "1em 0",
                      maxWidth: "340px",
                      borderRadius: "12px",
                      boxShadow: "0 2px 16px #b4b4d820"
                    }}
                  />
                )}
                <div style={{ display: "flex", gap: "1.2em", justifyContent: "center", marginTop: "1em" }}>
                  {confirmId === item.event_id ? (
                    <button
                      style={{
                        background: "#f43f5e",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        padding: "0.7em 2em",
                        fontWeight: "bold",
                        fontSize: "1.08em",
                        cursor: "pointer",
                        boxShadow: "0 2px 8px #f43f5e40",
                        letterSpacing: "0.05em",
                        transition: "background 0.2s"
                      }}
                      onClick={() => handleCancel(item.event_id)}
                      disabled={canceling}
                    >
                      {canceling ? "キャンセル中..." : "本当にキャンセルする"}
                    </button>
                  ) : (
                    <button
                      style={{
                        background: "linear-gradient(90deg, #5a5af0 0%, #b4b4d8 100%)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        padding: "0.7em 2em",
                        fontWeight: "bold",
                        fontSize: "1.08em",
                        cursor: "pointer",
                        boxShadow: "0 2px 8px #b4b4d820",
                        letterSpacing: "0.05em",
                        transition: "background 0.2s"
                      }}
                      onClick={() => setConfirmId(item.event_id)}
                      disabled={canceling}
                    >
                      参加キャンセル
                    </button>
                  )}
                </div>
                {confirmId === item.event_id && (
                  <div style={{ color: "#f43f5e", marginTop: "0.7em", fontWeight: "bold", fontSize: "1.05em" }}>
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
    </div>
  );
}