import { useEffect, useState } from "react";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    fetch("https://0x0-showevent-hbbadxcxh9a4bzhu.japaneast-01.azurewebsites.net/api/showevent?code=KjUCLx4igb6FiJ3ZtQKowVUUk9MgUtPSuBhPrMam2RwxAzFuTt1T_w%3D%3D") // 全イベント取得API
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

    // カテゴリー一覧をCATEGORYSテーブルAPIから取得
    fetch("https://0x0-showevent-hbbadxcxh9a4bzhu.japaneast-01.azurewebsites.net/api/categories?code=qPu7q4iQBMrEMTPaYXSYNOrzTnAm5yplhzIJ9JfIq-vWAzFukZ5pSA%3D%3D")
      .then(res => res.json())
      .then(data => {
        setCategories(Array.isArray(data) ? data.map(cat => ({ id: cat.category_id, name: cat.category_name })) : []);
      })
      .catch(err => {
        setError("カテゴリー取得エラー: " + err.message);
      });
  }, []);

  // 表示するカラムを限定
  const filteredKeys = ["event_title", "event_datetime", "deadline", "location"];

  return (
    <div style={{ padding: "2rem" }}>
      <h1>イベント一覧</h1>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="category-select">カテゴリーで絞り込み: </label>
        <select
          id="category-select"
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
        >
          <option value="">すべて</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="date-select">開催日で絞り込み: </label>
        <input
          type="date"
          id="date-select"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
        />
        {selectedDate && (
          <button onClick={() => setSelectedDate("")}>クリア</button>
        )}
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="keyword-search">キーワード検索: </label>
        <input
          type="text"
          id="keyword-search"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          placeholder="イベント名で検索"
        />
        {keyword && (
          <button onClick={() => setKeyword("")}>クリア</button>
        )}
      </div>
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
          {events
            .filter(ev => !selectedCategory || String(ev.event_category) === String(selectedCategory))
            .filter(ev => !selectedDate || (ev.event_datetime && ev.event_datetime.slice(0,10) === selectedDate))
            .filter(ev => !keyword || (ev.event_title && ev.event_title.includes(keyword)))
            .map((event, idx) => (
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
