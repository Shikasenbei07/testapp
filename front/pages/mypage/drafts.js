import { useRouter } from "next/router";
import { useDraftEvents } from "../../hooks/useDraftEvents";
import EventList from "../../components/EventList";

export default function DraftEventsContainer() {
  const { events, loading, error } = useDraftEvents();
  const router = useRouter();

  const handleEdit = (eventId) => {
    router.push(`/event/edit?event_id=${eventId}`);
  };

  if (loading) return <div style={{ textAlign: "center" }}>読み込み中...</div>;
  if (error) return <div style={{ color: "red", textAlign: "center" }}>{error}</div>;

  return <EventList events={events} onEdit={handleEdit} title="下書きイベント一覧" />;
}