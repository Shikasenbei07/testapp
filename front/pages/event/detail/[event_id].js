import { useRouter } from 'next/router';
import { useEventDetail } from '../../../hooks/useEventDetail';
import EventDetailActions from '../../../components/EventDetailActions';
import EventDetailTable from '../../../components/EventDetailTable';
import EventDetailImage from '../../../components/EventDetailImage';
import { useEffect, useState } from 'react';

export default function EventDetail() {
  const router = useRouter();
  const { event_id } = router.query;
  const { event, error } = useEventDetail(event_id);

  // 参加者一覧取得
  const [participants, setParticipants] = useState([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);

  useEffect(() => {
    if (!event_id) return;
    setParticipantsLoading(true);
    fetch(
      "https://0x0-showevent-hbbadxcxh9a4bzhu.japaneast-01.azurewebsites.net/api/event_participants?code=vv8zlmwxVC52mdprOyIMVOfv57vntaOs76gVTmTtnsFXAzFu0hfiaQ%3D%3D",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: Number(event_id) }),
      }
    )
      .then((res) => res.json())
      .then((data) => setParticipants(data))
      .catch(() => setParticipants([]))
      .finally(() => setParticipantsLoading(false));
  }, [event_id]);

  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!event) return <div>読み込み中...</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>イベント詳細</h1>
      <EventDetailImage src={event.image} alt="イベント画像" />
      <EventDetailTable event={event} />
      <EventDetailActions event_id={event_id} event={event} router={router} />

      <h2>参加者一覧</h2>
      {participantsLoading ? (
        <div>参加者を取得中...</div>
      ) : participants.length === 0 ? (
        <div>参加者はいません。</div>
      ) : (
        <ul>
          {participants.map((user) => (
            <li key={user.id}>
              {user.id} {user.l_name ?? ""} {user.f_name ?? ""}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}