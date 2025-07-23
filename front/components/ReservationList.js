import { formatDate } from "../utils/reservationListHandlers";

export default function ReservationList({
  history,
  confirmId,
  setConfirmId,
  canceling,
  onCancel
}) {
  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {history
        .filter(item => !item.cancelled_at)
        .map(item => (
          <li key={item.event_id} style={{ marginBottom: "2em", borderBottom: "1px solid #2cb67d40", paddingBottom: "1em" }}>
            <div style={{ fontWeight: "bold", fontSize: "1.1em", color: "#7f5af0", background: "#fff", padding: "0.3em 0.7em", borderRadius: "6px", display: "inline-block" }}>
              イベント名: {item.event_title}
            </div>
            <div style={{ color: "#7f5af0" }}>
              日時: {formatDate(item.event_datetime)}
            </div>
            <div style={{ color: "#2cb67d" }}>
              場所: {item.location}
            </div>
            <div style={{ color: "#e0e7ff" }}>
              作成者: {item.creator}
            </div>
            {item.image && (
              <img src={item.image} alt="イベント画像" style={{ margin: "1em 0", maxWidth: "320px" }} />
            )}
            {confirmId === item.event_id ? (
              <button
                style={{ marginTop: "0.8em", background: "#f43f5e" }}
                onClick={() => onCancel(item.event_id)}
                disabled={canceling}
              >
                {canceling ? "キャンセル中..." : "本当にキャンセルする"}
              </button>
            ) : (
              <button
                style={{ marginTop: "0.8em" }}
                onClick={() => setConfirmId(item.event_id)}
                disabled={canceling}
              >
                参加キャンセル
              </button>
            )}
            {confirmId === item.event_id && (
              <div style={{ color: "#f43f5e", marginTop: "0.5em" }}>
                キャンセルしてもよろしいですか？
              </div>
            )}
          </li>
        ))}
    </ul>
  );
}