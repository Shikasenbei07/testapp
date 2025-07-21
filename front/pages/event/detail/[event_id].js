import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const API_URL_GET_EVENT_DETAIL = process.env.NEXT_PUBLIC_API_URL_GET_EVENT_DETAIL;

export default function EventDetail() {
  const router = useRouter();
  const { event_id } = router.query;
  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!event_id) return;
    fetch(`${API_URL_GET_EVENT_DETAIL}&event_id=${event_id}`)
      .then(res => res.json())
      .then(data => setEvent(data))
      .catch(err => setError('データ取得エラー: ' + err.message));
  }, [event_id]);

  if (error)
    return <div style={{ color: "red" }}>{error}</div>;
  if (!event)
    return <div>読み込み中...</div>;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(120deg, #e0e7ef 0%, #c7d2fe 60%, #a5b4fc 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Montserrat', 'Share Tech Mono', 'Fira Mono', 'Consolas', monospace"
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "20px",
          boxShadow: "0 8px 32px 0 #b4b4d880, 0 2px 8px #c7d2fe80",
          padding: "2.5em 2em",
          minWidth: "360px",
          maxWidth: "520px",
          width: "100%",
        }}
      >
        <h1
          style={{
            color: "#5a5af0",
            fontWeight: 900,
            fontSize: "2.1em",
            letterSpacing: "0.12em",
            marginBottom: "1.5rem",
            textShadow: "0 4px 16px #b4b4d850, 0 1px 0 #fff",
            textAlign: "center",
            fontFamily: "'Bebas Neue', 'Montserrat', 'Share Tech Mono', 'Fira Mono', 'Consolas', monospace",
            textTransform: "uppercase",
            lineHeight: 1.1,
          }}
        >
          イベント詳細
        </h1>
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: "0 0.7em",
            marginBottom: "1.5em",
            fontSize: "1.08em",
          }}
        >
          <tbody>
            <tr>
              <th style={{
                textAlign: "left",
                color: "#5a5af0",
                fontWeight: "bold",
                width: "5.5em",
                paddingRight: "1em",
                verticalAlign: "top"
              }}>タイトル</th>
              <td>{event.event_title}</td>
            </tr>
            <tr>
              <th style={{ textAlign: "left", color: "#5a5af0", fontWeight: "bold", verticalAlign: "top" }}>日時</th>
              <td>{event.event_datetime}</td>
            </tr>
            <tr>
              <th style={{ textAlign: "left", color: "#5a5af0", fontWeight: "bold", verticalAlign: "top" }}>締切</th>
              <td>{event.deadline}</td>
            </tr>
            <tr>
              <th style={{ textAlign: "left", color: "#5a5af0", fontWeight: "bold", verticalAlign: "top" }}>場所</th>
              <td>{event.location}</td>
            </tr>
            <tr>
              <th style={{ textAlign: "left", color: "#5a5af0", fontWeight: "bold", verticalAlign: "top" }}>内容</th>
              <td>{event.content}</td>
            </tr>
            <tr>
              <th style={{ textAlign: "left", color: "#5a5af0", fontWeight: "bold", verticalAlign: "top" }}>説明</th>
              <td>{event.description}</td>
            </tr>
          </tbody>
        </table>
        {event.image && (
          <div style={{ textAlign: "center", marginBottom: "1.5em" }}>
            <img
              src={event.image}
              alt="イベント画像"
              style={{
                maxWidth: "100%",
                borderRadius: "12px",
                boxShadow: "0 2px 12px #b4b4d820"
              }}
            />
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "center", gap: "1.2em" }}>
          <button
            onClick={() => router.back()}
            style={{
              background: "#e0e7ef",
              color: "#23263a",
              padding: "0.6em 1.6em",
              border: "1.5px solid #b4b4d8",
              borderRadius: "8px",
              fontWeight: "bold",
              fontSize: "1em",
              cursor: "pointer",
              boxShadow: "0 2px 8px #b4b4d820"
            }}
          >
            戻る
          </button>
          <button
            style={{
              background: "linear-gradient(90deg, #5a5af0 0%, #b4b4d8 100%)",
              color: "white",
              padding: "0.6em 2em",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              fontSize: "1em",
              cursor: "pointer",
              boxShadow: "0 2px 12px #b4b4d820"
            }}
            onClick={() => router.push(`/event/confirm?event_id=${event_id}`)}
          >
            参加
          </button>
        </div>
      </div>
    </div>
  );
}
