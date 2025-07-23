import { useRouter } from "next/router";
import { useDraftEvents } from "../../hooks/useDraftEvents";
import { useCreatedEventHandlers } from "../../hooks/useCreatedEventHandlers";
import EventList from "../../components/EventList";

export default function DraftEventsContainer() {
  const { events, loading, error } = useDraftEvents();
  const router = useRouter();

  // 共通ハンドラーをフックから取得
  const { handleEdit, handleDelete } = useCreatedEventHandlers(router);

  if (loading) return <div style={{ textAlign: "center" }}>読み込み中...</div>;
  if (error) return <div style={{ color: "red", textAlign: "center" }}>{error}</div>;

  return (
    <EventList
      events={events}
      onEdit={handleEdit}
      onDelete={handleDelete}
      title="下書きイベント一覧"
    />
  );
}