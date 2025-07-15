import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function EventConfirmPage() {
  const router = useRouter();
  const { event_id } = router.query;
  const [event, setEvent] = useState(null);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!event_id) return;
    fetch(`https://0x0-showevent-hbbadxcxh9a4bzhu.japaneast-01.azurewebsites.net/api/showevent?code=KjUCLx4igb6FiJ3ZtQKowVUUk9MgUtPSuBhPrMam2RwxAzFuTt1T_w%3D%3D&event_id=${event_id}`)
      .then((res) => res.json())
      .then((data) => {
        setEvent(data);
      })
      .catch((err) => {
        setError("データ取得エラー: " + err.message);
      });
  }, [event_id]);

  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!event) return <div>読み込み中...</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>イベント参加確認</h1>
      <p>以下のイベントに参加しますか？</p>
      <table border="1" cellPadding="8">
        <tbody>
          <tr>
            <th>タイトル</th>
            <td>{event.event_title}</td>
          </tr>
          <tr>
            <th>日時</th>
            <td>{event.event_datetime}</td>
          </tr>
          <tr>
            <th>場所</th>
            <td>{event.location}</td>
          </tr>
        </tbody>
      </table>
      <button style={{ marginTop: "1rem", background: "#43a047", color: "white", padding: "0.5rem 1.5rem", border: "none", borderRadius: "4px", cursor: "pointer" }}
        onClick={() => setShowModal(true)}
      >参加を確定</button>
      <button style={{ marginLeft: "1rem" }} onClick={() => router.back()}>戻る</button>

      {showModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.7)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{
            background: "#fff",
            color: "#a10000",
            padding: "2rem 3rem",
            borderRadius: "12px",
            boxShadow: "0 0 30px #a10000",
            textAlign: "center",
            minWidth: "320px"
          }}>
            <h2>参加が確定しました！</h2>
            <p>ご参加ありがとうございます。</p>
            <button
              style={{
                marginTop: "1.5rem",
                background: "#a10000",
                color: "#fff",
                padding: "0.5rem 2rem",
                border: "none",
                borderRadius: "6px",
                fontSize: "1.1rem",
                cursor: "pointer"
              }}
              onClick={() => router.push("/events")}
            >イベント一覧へ戻る</button>
          </div>
        </div>
      )}
    </div>
  );
}
