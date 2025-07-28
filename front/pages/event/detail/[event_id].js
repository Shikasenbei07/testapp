import { useRouter } from 'next/router';
import { useEventDetail } from '../../../hooks/useEventDetail';
import EventDetailActions from '../../../components/EventDetailActions';
import EventDetailTable from '../../../components/EventDetailTable';
import EventDetailImage from '../../../components/EventDetailImage';
import ParticipantsList from '../../../components/participation/ParticipantsList';

export default function EventDetail() {
  const router = useRouter();
  const eventId = router.query.event_id || router.query.eventId;
  const { event, error } = useEventDetail(eventId);

  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!event) return <div>読み込み中...</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>イベント詳細</h1>
      <EventDetailImage src={event.image} alt="イベント画像" />
      <EventDetailTable event={event} />
      <EventDetailActions event_id={eventId} event={event} router={router} />

      <ParticipantsList eventId={eventId} />
    </div>
  );
}