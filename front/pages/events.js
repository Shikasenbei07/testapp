import { useEffect, useState } from "react";

export default function EventsPage() {
  const [favorites, setFavorites] = useState([]);
  const userId = '0738';

  function toggleFavorite(eventId) {
    const userId = '0738';
    setFavorites(prev => {
      // すでにお気に入りの場合は何もしない（色も維持）
      if (prev.includes(eventId)) {
        return prev;
      }
      const updated = [...prev, eventId];
      // お気に入り追加時のみAPI呼び出し
      fetch("https://0x0-showevent-hbbadxcxh9a4bzhu.japaneast-01.azurewebsites.net/api/favorite?code=zsOO_WgPGY9dtEN_tkki1bHWPy8XYJQoQPo2G7ONmvsoAzFusJrTJg%3D%3D", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: eventId, id: userId })
      })
      .then(async res => {
        if (!res.ok) {
          const errorText = await res.text();
          let message = `お気に入り登録失敗: ${errorText}`;
          if (
            errorText.includes('PRIMARY KEY constraint') ||
            errorText.includes('duplicate key')
          ) {
            message = 'すでにお気に入り登録済みです';
            alert(message);
            window.location.href = '/events';
            throw new Error(errorText);
          }
          alert(message);
          throw new Error(errorText);
        }
        return res.text();
      })
      .then(data => {
        // 登録成功時に通知
        alert('お気に入りに登録しました');
      })
      .catch(err => {
        // 既にalert済みなのでconsoleのみ
        console.error("お気に入り登録APIエラー", err);
      });
      localStorage.setItem("favorites", JSON.stringify(updated));
      return updated;
    });
  }
  const [sortKey, setSortKey] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [keyword, setKeyword] = useState("");
  const [hideExpired, setHideExpired] = useState(false);

  useEffect(() => {
    // お気に入り情報をAPIから取得
    // お気に入り情報をAPIから取得（function key追加）
    fetch(`https://0x0-showevent-hbbadxcxh9a4bzhu.japaneast-01.azurewebsites.net/api/favorites?user_id=${userId}&code=zsOO_WgPGY9dtEN_tkki1bHWPy8XYJQoQPo2G7ONmvsoAzFusJrTJg%3D%3D`)
      .then(res => res.json())
      .then(data => {
        setFavorites(Array.isArray(data) ? data : []);
      })
      .catch(() => setFavorites([]));

    // イベント一覧取得API（function keyは既存でOK）
    fetch("https://0x0-showevent-hbbadxcxh9a4bzhu.japaneast-01.azurewebsites.net/api/showEvent?code=KjUCLx4igb6FiJ3ZtQKowVUUk9MgUtPSuBhPrMam2RwxAzFuTt1T_w%3D%3D")
      .then((res) => res.json())
      .then((data) => {
        const now = new Date();
        const filtered = Array.isArray(data)
          ? data.filter(event => {
              if (event.is_draft === 1 || event.is_draft === "1") return false;
              if (!event.deadline) return true;
              const deadline = new Date(event.deadline);
              return deadline >= now;
            })
          : [];
        setEvents(filtered);
      })
      .catch((err) => {
        setError("データ取得エラー: " + err.message);
      });

    // カテゴリー一覧取得API（function key追加）
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
  const displayKeys = ["event_title", "event_datetime", "deadline", "location", "participants_status"];

  return (
    <div>
      <div style={{ padding: "2rem" }}>
        <h1>イベント一覧</h1>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="sort-select">並び順: </label>
          <select
            id="sort-select"
            value={sortKey}
            onChange={e => setSortKey(e.target.value)}
          >
            <option value="">選択してください</option>
            <option value="event_id">新着順</option>
            <option value="current_participants">参加者数</option>
            <option value="vacancy">空き枠順</option>
            <option value="deadline">申し込み締め切り順</option>
          </select>
          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value)}
          >
            <option value="asc">昇順</option>
            <option value="desc">降順</option>
          </select>
        </div>
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
              <th>参加人数状況</th>
              <th>詳細</th>
              <th>お気に入り</th>
            </tr>
          </thead>
          <tbody>
            {[...events]
              .filter(ev => !selectedCategory || String(ev.event_category) === String(selectedCategory))
              .filter(ev => !selectedDate || (ev.event_datetime && ev.event_datetime.slice(0,10) === selectedDate))
              .filter(ev => !keyword || (ev.event_title && ev.event_title.includes(keyword)))
              .filter(ev => {
                if (!hideExpired) return true;
                if (!ev.deadline) return true;
                const now = new Date();
                const deadline = new Date(ev.deadline);
                return deadline >= now;
              })
              .sort((a, b) => {
                if (!sortKey) return 0;
                let aValue, bValue;
                if (sortKey === "vacancy") {
                  aValue = (a.max_participants ?? 0) - (a.current_participants ?? 0);
                  bValue = (b.max_participants ?? 0) - (b.current_participants ?? 0);
                } else if (sortKey === "deadline") {
                  aValue = a.deadline ? new Date(a.deadline).getTime() : 0;
                  bValue = b.deadline ? new Date(b.deadline).getTime() : 0;
                } else {
                  aValue = a[sortKey] ?? 0;
                  bValue = b[sortKey] ?? 0;
                }
                if (sortOrder === "asc") {
                  return aValue - bValue;
                } else {
                  return bValue - aValue;
                }
              })
              .map((event, idx) => (
                <tr key={idx}>
                  {filteredKeys.map((key, i) => (
                    <td key={i}>{event[key]}</td>
                  ))}
                  <td>{`${event.current_participants ?? 0}/${event.max_participants ?? 0}`}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button onClick={() => window.location.href = `/event-detail?event_id=${event.event_id}`}>詳細</button>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => toggleFavorite(event.event_id)}
                      title="お気に入り登録"
                      style={{
                        backgroundColor: favorites.includes(event.event_id) ? 'yellow' : '',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        padding: '4px 10px',
                      }}
                    >
                      ★
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
