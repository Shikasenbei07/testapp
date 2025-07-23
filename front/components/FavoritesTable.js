export default function FavoritesTable({ favorites, onRemove, onDetail }) {
  const thStyle = {
    padding: "12px 8px",
    fontWeight: 700,
    fontSize: "1rem",
    borderBottom: "2px solid #e0e0e0",
    textAlign: "center",
    color: "#222"
  };

  const tdStyle = {
    padding: "10px 8px",
    textAlign: "center",
    fontSize: "0.98rem",
    color: "#222"
  };

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={thStyle}>イベント名</th>
          <th style={thStyle}>日時</th>
          <th style={thStyle}>場所</th>
          <th style={thStyle}>説明</th>
          <th style={thStyle}>操作</th>
        </tr>
      </thead>
      <tbody>
        {favorites.map((item, idx) => (
          <tr key={idx} style={{ background: idx % 2 === 0 ? "#f9f9f9" : "#fff" }}>
            <td style={tdStyle}>{item.event_title}</td>
            <td style={tdStyle}>{item.event_datetime ? new Date(item.event_datetime).toLocaleString() : ""}</td>
            <td style={tdStyle}>{item.location}</td>
            <td style={tdStyle}>{item.description}</td>
            <td style={tdStyle}>
              <button
                style={{
                  background: "#ff6666",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "6px 0",
                  fontWeight: 600,
                  cursor: "pointer",
                  marginRight: 8,
                  fontSize: "0.97rem",
                  minWidth: 120,
                  boxSizing: "border-box",
                  display: "inline-block",
                }}
                onClick={() => onRemove(item.event_id)}
              >
                お気に入り解除
              </button>
              <button
                style={{
                  background: "#00c2a0",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "6px 0",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: "0.97rem",
                  minWidth: 120,
                  boxSizing: "border-box",
                  display: "inline-block",
                }}
                onClick={() => onDetail(item)}
              >
                詳細
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}