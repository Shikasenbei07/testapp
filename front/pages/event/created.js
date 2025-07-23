import { useRouter } from "next/router";
import { getValidId } from "../../utils/getValidId";
import EventList from "../../components/EventList";
import { useSelfCreatedEvents } from "../../hooks/useSelfCreatedEvents";
import { useCreatedEventHandlers } from "../../hooks/useCreatedEventHandlers";

export default function CreatedEventsContainer() {
  const userId = getValidId();
  const { events, error } = useSelfCreatedEvents(userId);
  const { handleEdit, handleDelete } = useCreatedEventHandlers();

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  return (
    <EventList
      events={events}
      onEdit={handleEdit}
      onDelete={handleDelete}
      title="作成済みイベント一覧"
    />
  );
}
