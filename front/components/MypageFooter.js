export default function MypageFooter({ onLogout, onSetting }) {
  return (
    <div>
      <button
        onClick={onLogout}
        style={{ marginRight: 12, padding: "8px 16px", background: "#ff6666", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700 }}
      >
        ログアウト
      </button>
      <button
        style={{ padding: "8px 16px", background: "#e0e0e0", color: "#333", border: "none", borderRadius: 6, fontWeight: 700 }}
        onClick={onSetting}
      >
        設定へ
      </button>
    </div>
  );
}