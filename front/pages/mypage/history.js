import { useRouter } from "next/router";
import { useReservationHistory } from "../../hooks/useReservationHistory";
import { handleDetail, handleCancelReservation } from "../../utils/reservationHistoryHandlers";
import ReservationHistoryTable from "../../components/ReservationHistoryTable";

export default function ReservationHistory() {
  const router = useRouter();
  const { history, setHistory, loading, error } = useReservationHistory();

  if (loading) return <div style={loadingStyle}>🌀 ローディング中...</div>;
  if (error) return <div style={errorStyle}>{error}</div>;

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>
        <span>イベント参加履歴</span>
      </h2>
      {history.length === 0 ? (
        <div style={emptyStyle}>履歴がありません。</div>
      ) : (
        <ReservationHistoryTable
          history={history}
          onDetail={item => handleDetail(router, item)}
          onCancel={event_id => handleCancelReservation(event_id, history, setHistory)}
        />
      )}
    </div>
  );
}

// --- スタイル定義 ---
const containerStyle = {
  maxWidth: 900,
  margin: "40px auto",
  background: "#fff",
  borderRadius: 12,
  boxShadow: "0 4px 24px #0001",
  padding: 36,
  color: "#222",
  fontFamily: "'Noto Sans JP', 'Helvetica Neue', Arial, 'メイリオ', sans-serif",
  border: "1.5px solid #e0e0e0",
  position: "relative",
  overflow: "auto"
};

const headingStyle = {
  textAlign: "center",
  fontSize: "2.1rem",
  letterSpacing: "0.08em",
  marginBottom: 32,
  color: "#222",
  fontWeight: 700,
  fontFamily: "'Noto Sans JP', 'Helvetica Neue', Arial, 'メイリオ', sans-serif",
  borderBottom: "2px solid #00c2a0",
  paddingBottom: 10
};

const loadingStyle = {
  textAlign: "center",
  marginTop: "3rem",
  color: "#00c2a0",
  fontFamily: "monospace",
  fontSize: "1.5rem"
};

const errorStyle = {
  color: "#ff0055",
  textAlign: "center",
  marginTop: "3rem",
  fontFamily: "monospace",
  fontSize: "1.2rem"
};

const emptyStyle = {
  textAlign: "center",
  fontSize: "1.1rem",
  color: "#00c2a0",
  margin: "32px 0"
};