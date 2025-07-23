import { useState } from "react";
import { useReservationList } from "../../hooks/useReservationList";
import { handleCancelReservation } from "../../utils/reservationListHandlers";
import ReservationList from "../../components/ReservationList";
import ReservationListAlert from "../../components/ReservationListAlert";

export default function ReservationHistory() {
  const { history, loading, fetchHistory, userId } = useReservationList();
  const [canceling, setCanceling] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [alertMsg, setAlertMsg] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  function showCustomAlert(msg) {
    setAlertMsg(msg);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 2500);
  }

  if (loading) return <div className="card" style={{ textAlign: "center" }}>読み込み中...</div>;
  if (!history.length) return <div className="card" style={{ textAlign: "center" }}>参加予約はありません。</div>;

  return (
    <div className="card" style={{ position: "relative" }}>
      <h2 style={{ color: "#7f5af0", marginBottom: "1.5em" }}>予約一覧</h2>
      <ReservationList
        history={history}
        confirmId={confirmId}
        setConfirmId={setConfirmId}
        canceling={canceling}
        onCancel={event_id =>
          handleCancelReservation({
            event_id,
            userId,
            fetchHistory,
            showCustomAlert,
            setConfirmId,
            setCanceling
          })
        }
      />
      <ReservationListAlert show={showAlert} msg={alertMsg} />
    </div>
  );
}