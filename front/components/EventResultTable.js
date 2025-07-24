import React from "react";

export default function EventResultTable({
  events,
  favorites,
  filteredKeys,
  sortKey,
  sortOrder,
  selectedCategory,
  selectedDate,
  keyword,
  hideExpired,
  toggleFavorite,
}) {
  return (
    <table border="1" cellPadding="8">
      <thead>
        <tr>
          <th></th>
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
          // ↓ キーワードが入力されている場合はキーワードで部分一致検索（イベント名では検索しない）
          .filter(ev => {
            if (!keyword) return true;
            // キーワード配列がなければ「一致しない」ではなく「false」ではなく「true」にする
            if (!Array.isArray(ev.keywords) || ev.keywords.length === 0) return false;
            return ev.keywords.some(kw =>
              (kw.keyword_name || kw).toLowerCase().includes(keyword.toLowerCase())
            );
          })
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
              <td>
                {event.image ? (
                  <img
                    src={event.image}
                    alt="イベント画像"
                    style={{ maxWidth: 80, maxHeight: 80, objectFit: "cover", border: "1px solid #ccc" }}
                  />
                ) : (
                  <span></span>
                )}
              </td>
              {filteredKeys.map((key, i) => (
                <td key={i}>
                  {(key === "event_datetime" || key === "deadline") && event[key]
                    ? event[key].replace(/:\d{2}$/, "")
                    : event[key]}
                </td>
              ))}
              <td>{`${event.current_participants ?? 0}/${event.max_participants ?? 0}`}</td>
              <td style={{ textAlign: 'center' }}>
                <button onClick={() => window.location.href = `/event/detail/${event.event_id}`}>詳細</button>
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
  );
}