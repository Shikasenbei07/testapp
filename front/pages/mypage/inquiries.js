import { useEffect, useState } from "react";
import { getValidId } from "../../utils/getValidId";

export default function InquiryHistory() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const userId = getValidId();

  useEffect(() => {
    async function fetchInquiries() {
      setLoading(true);
      try {
        const res = await fetch(
          "http://localhost:7071/api/get_inquiries",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: userId })
          }
        );
        const data = await res.json();
        if (!res.ok) throw new Error("error: " + data.error);
        
        setInquiries(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchInquiries();
  }, [userId]);

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error}</div>;
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