import { useEffect, useState } from "react";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:7071/api/showEvent") // 全イベント取得API
      .then((res) => res.json())
      .then((data) => {
        // is_draftが1のものは除外
        const filtered = Array.isArray(data)
          ? data.filter(event => event.is_draft !== 1 && event.is_draft !== "1")
          : [];
        setEvents(filtered);
      })
      .catch((err) => {
        setError("データ取得エラー: " + err.message);
      });
  }, []);

  // 表示するカラムを限定
  const filteredKeys = ["event_title", "event_datetime", "deadline", "location"];

  return (
    <div style={{ padding: "2rem" }}>
      <h1>イベント一覧</h1>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>イベント名</th>
            <th>開催日時</th>
            <th>申し込み期限</th>
            <th>開催場所</th>
            <th>詳細</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event, idx) => (
            <tr key={idx}>
              {filteredKeys.map((key, i) => (
                <td key={i}>{event[key]}</td>
              ))}
              <td>
                <button onClick={() => window.location.href = `/event-detail?event_id=${event.event_id}`}>詳細</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
