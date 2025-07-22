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
    const eventIdNum = Number(event_id);
    const trimmedId = id ? id.trim() : "";
    console.log("送信内容", { event_id: eventIdNum, id: trimmedId });
    if (!trimmedId || !eventIdNum) {
      alert("ユーザーIDまたはイベントIDがありません");
      return;
    }
    try {
      const res = await fetch(API_URL_CANCEL_PARTICIPATION, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: eventIdNum, id: trimmedId })
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
    <div style={{ padding: "2rem" }}>
      <h1>イベント詳細</h1>
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
            <th>締切</th>
            <td>{event.deadline}</td>
          </tr>
          <tr>
            <th>場所</th>
            <td>{event.location}</td>
          </tr>
          <tr>
            <th>内容</th>
            <td>{event.content}</td>
          </tr>
          <tr>
            <th>説明</th>
            <td>{event.description}</td>
          </tr>
        </tbody>
      </table>
      {event.image && (
        <div>
          <img
            src={event.image}
            alt="イベント画像"
            style={{ maxWidth: "100%" }}
          />
        </div>
      )}
      <button onClick={() => router.push('/event')}>戻る</button>
      {participatedContent}
    </div>
  );
}
