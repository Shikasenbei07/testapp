import { useRouter } from 'next/router';
import { useEventDetail } from '../../../hooks/useEventDetail';
import EventDetailActions from '../../../components/EventDetailActions';
import EventDetailTable from '../../../components/EventDetailTable';
import EventDetailImage from '../../../components/EventDetailImage';

export default function EventDetail() {
  const router = useRouter();
  const { event_id } = router.query;
  const { event, error } = useEventDetail(event_id);

  if (error)
    return <div style={{ color: "red" }}>{error}</div>;
  if (!event)
    return <div>読み込み中...</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>イベント詳細</h1>
      <EventDetailImage src={event.image} alt="イベント画像" />
      <EventDetailTable event={event} />
      <EventDetailActions event_id={event_id} event={event} router={router} />
    </div>
  );
}