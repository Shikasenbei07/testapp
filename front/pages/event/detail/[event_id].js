import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getValidId } from '../../../utils/getValidId';

const API_URL_GET_EVENT_DETAIL = process.env.NEXT_PUBLIC_API_URL_GET_EVENT_DETAIL;
const API_URL_CANCEL_PARTICIPATION = process.env.NEXT_PUBLIC_API_URL_CANCEL_PARTICIPATION;

export default function EventDetail() {
  const router = useRouter();
  const { event_id, participated } = router.query;
  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);
  const [id, setId] = useState(null);

  // idをuseEffectで取得
  useEffect(() => {
    setId(getValidId());
  }, []);

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

  // 参加キャンセル処理
  const handleCancelParticipation = async () => {
    console.log("送信内容", { event_id: Number(event_id), id });
    const eventIdNum = Number(event_id);
    console.log("送信するevent_id型:", typeof eventIdNum, eventIdNum); // ここで型を確認
    if (!id || !event_id) {
      alert("ユーザーIDまたはイベントIDがありません");
      return;
    }
    try {
      const res = await fetch('https://0x0-participation-d7fqb7h3dpcqcxek.japaneast-01.azurewebsites.net/api/cancel-participation?code=A_pQkS9M22eHhdEzHAMDWrwMC5HN7vzWqbSbsbtsf9RRAzFuKdmAVA%3D%3D', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: eventIdNum, id })
      });
      if (res.ok) {
        alert("参加をキャンセルしました");
        router.push(`/event/detail/${event_id}?participated=0&user_id=${id}`);
      } else {
        const msg = await res.text();
        alert("キャンセル失敗: " + msg);
      }
    } catch (e) {
      alert("通信エラー: " + e.message);
    }
  };

  let participatedContent;
  if (participated === "0") {
    participatedContent = (
      <button
        style={{
          marginLeft: '1rem',
          background: '#1976d2',
          color: 'white',
          padding: '0.5rem 1.5rem',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
        onClick={() => router.push(`/event/confirm?event_id=${event_id}`)}
      >
        参加
      </button>
    );
  } else if (participated === "1") {
    participatedContent = (
      <button
        style={{
          marginLeft: '1rem',
          background: '#d32f2f',
          color: 'white',
          padding: '0.5rem 1.5rem',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
        onClick={async () => {
          if (window.confirm("本当に参加を取り消しますか？")) {
            await handleCancelParticipation();
          }
        }}
      >
        参加キャンセル
      </button>
    );
  } else if (participated === null || typeof participated === "undefined") {
    participatedContent = (
      <div style={{ color: "#a10000", margin: "1rem 0" }}>
        パラメータがありません
      </div>
    );
  } else {
    participatedContent = <div>参加状況確認中...</div>;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "linear-gradient(120deg, #e0e7ef 0%, #c7d2fe 60%, #a5b4fc 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Montserrat', 'Noto Sans JP', 'Helvetica Neue', Arial, 'メイリオ', sans-serif",
        padding: 0,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 28,
          boxShadow: "0 12px 40px #b4b4d880, 0 2px 8px #c7d2fe80",
          padding: "56px 48px 48px 48px",
          color: "#23263a",
          fontFamily: "'Montserrat', 'Noto Sans JP', 'Helvetica Neue', Arial, 'メイリオ', sans-serif",
          border: "2.5px solid #e0e7ef",
          minWidth: 340,
          maxWidth: 820,
          width: "98vw",
          textAlign: "center",
          transition: "box-shadow 0.2s"
        }}
      >
        <h1
          style={{
            color: "#5a5af0",
            fontWeight: 900,
            fontSize: "2.3em",
            letterSpacing: "0.12em",
            marginBottom: "1.8em",
            textShadow: "0 4px 16px #b4b4d850, 0 1px 0 #fff",
            borderBottom: "3px solid #5a5af0",
            paddingBottom: 18,
            textTransform: "uppercase"
          }}
        >
          イベント詳細
        </h1>
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
            marginBottom: "2.5em",
            background: "#f8faff",
            borderRadius: "18px",
            overflow: "hidden",
            boxShadow: "0 2px 16px #b4b4d820"
          }}
        >
          <tbody>
            {[
              { label: "タイトル", value: event.event_title },
              { label: "日時", value: event.event_datetime },
              { label: "締切", value: event.deadline },
              { label: "場所", value: event.location },
              { label: "内容", value: event.content },
              { label: "説明", value: event.description }
            ].map((row, idx) => (
              <tr key={row.label}>
                <th style={{
                  background: "#5a5af0",
                  color: "#fff",
                  fontWeight: 700,
                  padding: "1.1em 1.5em",
                  width: "28%",
                  textAlign: "right",
                  borderRight: "2px solid #e0e7ef",
                  fontSize: "1.08em",
                  borderTopLeftRadius: idx === 0 ? "18px" : 0,
                  borderBottomLeftRadius: idx === 5 ? "18px" : 0
                }}>{row.label}</th>
                <td style={{
                  padding: "1.1em 1.5em",
                  textAlign: "left",
                  background: "#fff",
                  fontSize: "1.08em",
                  borderTopRightRadius: idx === 0 ? "18px" : 0,
                  borderBottomRightRadius: idx === 5 ? "18px" : 0
                }}>{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {event.image && (
          <div style={{ marginBottom: "2.5em" }}>
            <img
              src={event.image}
              alt="イベント画像"
              style={{
                maxWidth: "100%",
                borderRadius: "16px",
                boxShadow: "0 2px 20px #b4b4d820"
              }}
            />
          </div>
        )}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "2em",
          marginTop: "2.5em"
        }}>
          <button
            onClick={() => router.push('/event')}
            style={{
              background: "#e0e7ef",
              color: "#23263a",
              border: "1.5px solid #b4b4d8",
              borderRadius: "10px",
              padding: "0.9em 2.2em",
              fontWeight: "bold",
              fontSize: "1.1em",
              cursor: "pointer",
              boxShadow: "0 2px 8px #b4b4d820",
              letterSpacing: "0.07em",
              transition: "background 0.2s"
            }}
          >
            戻る
          </button>
          {participatedContent}
        </div>
      </div>
    </div>
  );
}