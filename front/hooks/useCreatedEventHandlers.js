import { useRouter } from "next/router";

export function useCreatedEventHandlers() {
  const router = useRouter();

  const handleEdit = (eventId) => {
    router.push(`/event/edit?event_id=${eventId}`);
  };

  const handleDelete = (eventId) => {
    localStorage.setItem("fromCreated", "1");
    router.push(`/event/delete/confirm?event_id=${eventId}`);
  };

  return { handleEdit, handleDelete };
}