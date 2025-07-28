import { useRouter } from 'next/router';
import { useEventDetail } from '../../../hooks/useEventDetail';
import EventDetailActions from '../../../components/EventDetailActions';
import EventDetailTable from '../../../components/EventDetailTable';
import EventDetailImage from '../../../components/EventDetailImage';
import ParticipantsList from '../../../components/ParticipantsList';
import { useEffect, useState } from 'react';

const API_URL_GET_PARTICIPANTS = process.env.NEXT_PUBLIC_API_URL_GET_PARTICIPANTS;

export default function EventDetail() {
  const router = useRouter();
  const eventId = router.query.event_id || router.query.eventId; // ここを修正
  const { event, error } = useEventDetail(eventId);

  // 参加者一覧取得
  const [participants, setParticipants] = useState([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    setParticipantsLoading(true);
    fetch(`${API_URL_GET_PARTICIPANTS}&event_id=${eventId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data) => {
        // 配列でなければ空配列にする
        setParticipants(Array.isArray(data) ? data : []);
      })
      .catch(() => setParticipants([]))
      .finally(() => setParticipantsLoading(false));
  }, [eventId]);

  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!event) return <div>読み込み中...</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>イベント詳細</h1>
      <EventDetailImage src={event.image} alt="イベント画像" />
      <EventDetailTable event={event} />
      <EventDetailActions event_id={eventId} event={event} router={router} />

      <ParticipantsList participants={participants} loading={participantsLoading} />
    </div>
  );
}