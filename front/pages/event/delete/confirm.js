import { useRouter } from "next/router";
import { useEventDeleteConfirm } from "../../../hooks/useEventDeleteConfirm";
import { useFromCreatedGuard } from "../../../hooks/useFromCreatedGuard";
import EventDeleteConfirmView from "../../../components/EventDeleteConfirmView";

export default function EventDeleteConfirm() {
  const router = useRouter();
  const isValid = useFromCreatedGuard();

  const {
    eventData,
    loading,
    error,
    handleDelete,
  } = useEventDeleteConfirm(router);

  if (isValid === null) {
    // 判定中は何も表示しない
    return null;
  }

  if (!isValid) {
    return (
      <div style={{ color: "red", textAlign: "center", marginTop: "3rem" }}>
        無効なアクセスです
      </div>
    );
  }

  return (
    <EventDeleteConfirmView
      eventData={eventData}
      loading={loading}
      error={error}
      onDelete={handleDelete}
      onBack={() => router.back()}
    />
  );
}
