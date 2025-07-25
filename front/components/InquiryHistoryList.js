import { useRouter } from "next/router";

export default function InquiryHistoryList({ inquiries }) {
  const router = useRouter();

  if (!inquiries.length) return <div>問い合わせ履歴はありません。</div>;

  return (
    <div className="card">
      <h2 className="inquiry-history-title">問い合わせ履歴</h2>
      <ul className="inquiry-history-list">
        {inquiries.map((item, idx) => (
          <li
            key={`${item.inquiry_id}-${idx}`}
            className="inquiry-history-item"
            onClick={() => router.push(`/inquiry/${item.hashed_inquiry_id}`)}
          >
            <div className="inquiry-event-title">
              イベント名: {item.event_title}
            </div>
            <div>件名: {item.inquiry_title}</div>
            <div>件数: {item.count}</div>
          </li>
        ))}
      </ul>
      <style jsx>{`
        .inquiry-history-title {
          color: #7f5af0;
          margin-bottom: 1.5em;
        }
        .inquiry-history-list {
          list-style: none;
          padding: 0;
        }
        .inquiry-history-item {
          margin-bottom: 2em;
          border-bottom: 1px solid #2cb67d40;
          padding-bottom: 1em;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }
        .inquiry-history-item:hover {
          background: #f3f0ff;
          color: #7f5af0;
        }
        .inquiry-event-title {
          font-weight: bold;
          font-size: 1.1em;
          color: #7f5af0;
        }
      `}</style>
    </div>
  );
}