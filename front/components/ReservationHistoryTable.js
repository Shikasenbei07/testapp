export default function ReservationHistoryTable({ history, onDetail, onCancel }) {
  return (
    <table className="responsive-table" style={{
      width: "100%",
      borderCollapse: "separate",
      borderSpacing: 0,
      background: "#fff",
      borderRadius: 8,
      overflow: "hidden",
      boxShadow: "0 2px 12px #0001",
      border: "1px solid #e0e0e0"
    }}>
      <thead>
        <tr>
          <th className="connpass-th" style={thStyle}>イベント名</th>
          <th className="connpass-th" style={thStyle}>日時</th>
          <th className="connpass-th" style={thStyle}>説明</th>
          <th className="connpass-th" style={thStyle}>操作</th>
        </tr>
      </thead>
      <tbody>
        {history
          .filter(item => (item.registration_status === undefined || item.registration_status === 1 || item.registration_status === "1"))
          .map((item, idx) => (
            <tr key={idx} className="connpass-row" style={{
              background: idx % 2 === 0 ? "#f9f9f9" : "#fff"
            }}>
              <td style={tdStyle}>
                <span className="event-title">{item.event_title ?? ""}</span>
              </td>
              <td style={tdStyle}>{item.event_datetime ? new Date(item.event_datetime).toLocaleString() : ""}</td>
              <td style={tdStyle}>{item.description ?? ""}</td>
              <td style={tdStyle}>
                <button
                  style={detailButtonStyle}
                  onClick={() => onDetail(item)}
                >
                  予約詳細
                </button>
                <button
                  style={cancelButtonStyle}
                  onClick={() => onCancel(item.event_id)}
                >
                  キャンセル
                </button>
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}

const thStyle = {
  padding: "14px 10px",
  fontWeight: 700,
  fontSize: "1rem",
  borderBottom: "2px solid #e0e0e0",
  textAlign: "center",
  letterSpacing: "0.04em",
  color: "#222"
};

const tdStyle = {
  padding: "12px 8px",
  textAlign: "center",
  fontSize: "0.98rem",
  borderBottom: "1px solid #f0f0f0",
  color: "#222"
};

const detailButtonStyle = {
  background: "#00c2a0",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  padding: "6px 16px",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: "0.97rem",
  transition: "background 0.2s",
  marginRight: "0.5rem"
};

const cancelButtonStyle = {
  background: "#ff6666",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  padding: "6px 16px",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: "0.97rem",
  transition: "background 0.2s"
};