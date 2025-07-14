import { useRouter } from "next/router";
import { useEffect, useState } from "react";

// 取得時（例：マイページなどで利用する場合）
function getValidId() {
  const id = localStorage.getItem("id");
  const expire = localStorage.getItem("id_expire");
  if (!id || !expire || Date.now() > Number(expire)) {
    localStorage.removeItem("id");
    localStorage.removeItem("id_expire");
    return null;
  }
  return id;
}

export default function ReservationDetail() {
  const router = useRouter();
  const [detail, setDetail] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (router.isReady) {
      setDetail({
        event_id: router.query.event_id ?? "", // ← ここで受け取る
        event_title: router.query.event_title ?? "",
        event_datetime: router.query.event_datetime ?? "",
        location: router.query.location ?? "",
        description: router.query.description ?? "",
        content: router.query.content ?? ""
      });
    }
  }, [router.isReady, router.query]);

  if (!detail) {
    return <div style={{ textAlign: "center", marginTop: "3rem", color: "#00c2a0" }}>読み込み中...</div>;
  }

  const handleCancel = async () => {
    // event_idとuser_idをAPIに渡す
    const res = await fetch("/api/cancel-reservation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_id: detail.event_id })
    });
    if (res.ok) {
      router.replace("/cancel-complete");
    } else {
      alert("キャンセルに失敗しました");
    }
  };

  return (
    <div style={{
      maxWidth: 600,
      margin: "40px auto",
      background: "#fff",
      borderRadius: 12,
      boxShadow: "0 4px 24px #0001",
      padding: 36,
      color: "#222",
      fontFamily: "'Noto Sans JP', 'Helvetica Neue', Arial, 'メイリオ', sans-serif",
      border: "1.5px solid #e0e0e0",
      position: "relative"
    }}>
      <h2 style={{
        textAlign: "center",
        fontSize: "2rem",
        letterSpacing: "0.08em",
        marginBottom: 32,
        color: "#00c2a0",
        fontWeight: 700,
        borderBottom: "2px solid #00c2a0",
        paddingBottom: 10
      }}>
        予約詳細
      </h2>
      <table style={{ width: "100%", fontSize: "1.08rem", borderCollapse: "separate", borderSpacing: 0 }}>
        <tbody>
          <tr>
            <th style={detailThStyle}>イベント名</th>
            <td style={detailTdStyle}>{detail.event_title}</td>
          </tr>
          <tr>
            <th style={detailThStyle}>日時</th>
            <td style={detailTdStyle}>{detail.event_datetime ? new Date(detail.event_datetime).toLocaleString() : ""}</td>
          </tr>
          <tr>
            <th style={detailThStyle}>場所</th>
            <td style={detailTdStyle}>{detail.location}</td>
          </tr>
          <tr>
            <th style={detailThStyle}>説明</th>
            <td style={detailTdStyle}>{detail.description}</td>
          </tr>
          <tr>
            <th style={detailThStyle}>内容</th>
            <td style={detailTdStyle}>{detail.content}</td>
          </tr>
        </tbody>
      </table>
      <div style={{
        display: "flex",
        justifyContent: "space-between", // 左右に配置
        alignItems: "center",
        marginTop: 32
      }}>
        <button
          style={{
            background: "#e0e0e0",
            color: "#00c2a0",
            border: "none",
            borderRadius: 6,
            padding: "8px 24px",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: "1rem"
          }}
          onClick={() => router.back()}
        >
          戻る
        </button>
        <button
          style={{
            background: "linear-gradient(90deg, #ff4d4f 0%, #ff7875 100%)",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "10px 28px",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: "1.08rem",
            boxShadow: "0 2px 8px #ff4d4f33",
            letterSpacing: "0.05em",
            transition: "background 0.2s"
          }}
          onClick={() => setShowConfirm(true)}
        >
          予約キャンセル
        </button>
      </div>
      {showConfirm && (
        <div style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.25)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{
            background: "#fff",
            borderRadius: 12,
            padding: "32px 28px 24px 28px",
            minWidth: 320,
            boxShadow: "0 4px 24px #0002",
            position: "relative"
          }}>
            <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "#ff4d4f", marginBottom: 28, textAlign: "center" }}>
              キャンセルしてもよろしいですか？
            </div>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <button
                style={{
                  background: "#e0e0e0",
                  color: "#00c2a0",
                  border: "none",
                  borderRadius: 6,
                  padding: "8px 24px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: "1rem"
                }}
                onClick={() => setShowConfirm(false)}
              >
                戻る
              </button>
              <button
                style={{
                  background: "linear-gradient(90deg, #ff4d4f 0%, #ff7875 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "10px 28px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: "1.08rem",
                  boxShadow: "0 2px 8px #ff4d4f33",
                  letterSpacing: "0.05em",
                  transition: "background 0.2s"
                }}
                onClick={handleCancel}
              >
                確定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const detailThStyle = {
  textAlign: "right",
  background: "#f5f5f5",
  padding: "10px 16px",
  fontWeight: 700,
  color: "#00c2a0",
  width: "120px",
  borderBottom: "1px solid #e0e0e0"
};

const detailTdStyle = {
  textAlign: "left",
  padding: "10px 16px",
  borderBottom: "1px solid #e0e0e0"
};