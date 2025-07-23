export default function InquiryHistoryList({ inquiries }) {
  if (!inquiries.length) return <div>問い合わせ履歴はありません。</div>;

  return (
    <div className="card">
      <h2 style={{ color: "#7f5af0", marginBottom: "1.5em" }}>問い合わせ履歴</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {inquiries.map(item => (
          <li key={item.event_id} style={{ marginBottom: "2em", borderBottom: "1px solid #2cb67d40", paddingBottom: "1em" }}>
            <div style={{ fontWeight: "bold", fontSize: "1.1em", color: "#7f5af0" }}>
              イベント名: {item.event_title}
            </div>
            <div>件名: {item.count}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}