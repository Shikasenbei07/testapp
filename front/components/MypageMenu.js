export default function MypageMenu({ onNavigate }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
      <button
        style={{ padding: "10px 0", background: "#1976d2", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700, fontSize: "1rem", cursor: "pointer" }}
        onClick={() => onNavigate("/mypage/favorites")}
      >
        お気に入りイベント一覧
      </button>
      <button
        style={{ padding: "10px 0", background: "#00c2a0", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700, fontSize: "1rem", cursor: "pointer" }}
        onClick={() => onNavigate("/mypage/history")}
      >
        参加履歴
      </button>
      <button
        style={{ padding: "10px 0", background: "#7f5af0", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700, fontSize: "1rem", cursor: "pointer" }}
        onClick={() => onNavigate("/mypage/reservation")}
      >
        予約一覧
      </button>
      <button
        style={{ padding: "10px 0", background: "#ffb700", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700, fontSize: "1rem", cursor: "pointer" }}
        onClick={() => onNavigate("/event/created")}
      >
        作成済みイベント一覧
      </button>
      <button
        style={{ padding: "10px 0", background: "#e4572e", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700, fontSize: "1rem", cursor: "pointer" }}
        onClick={() => onNavigate("/mypage/drafts")}
      >
        下書きイベント一覧
      </button>
    </div>
  );
}