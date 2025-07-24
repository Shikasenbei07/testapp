import React, { useEffect } from "react";

export default function EventSearchForm({
  sortKey,
  setSortKey,
  sortOrder,
  setSortOrder,
  categories,
  selectedCategory,
  setSelectedCategory,
  selectedDate,
  setSelectedDate,
  keyword,
  setKeyword,
  eventTitle,
  setEventTitle,
  hideExpired,
  setHideExpired,
  error,
}) {
  // リセット処理
  const handleReset = () => {
    setSortKey("");
    setSortOrder("asc");
    setSelectedCategory("");
    setSelectedDate("");
    setKeyword("");
    if (setEventTitle) setEventTitle("");
    setHideExpired(true);
  };

  // ローカルストレージから初期値を取得し、取得後は削除
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("eventSearchKeyword");
      if (stored) {
        setKeyword(stored);
        window.localStorage.removeItem("eventSearchKeyword");
      } else {
        handleReset();
      }
    }
    // eslint-disable-next-line
  }, []);

  return (
    <div style={searchFormWrapperStyle}>
      <div style={formItemStyle}>
        <label htmlFor="sort-select">並び順: </label>
        <select
          id="sort-select"
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
        >
          <option value="">選択してください</option>
          <option value="event_id">新着順</option>
          <option value="current_participants">参加者数</option>
          <option value="vacancy">空き枠順</option>
          <option value="deadline">申し込み締め切り順</option>
        </select>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="asc">昇順</option>
          <option value="desc">降順</option>
        </select>
      </div>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <div style={formItemStyle}>
        <label htmlFor="category-select">カテゴリーで絞り込み: </label>
        <select
          id="category-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">すべて</option>
          {categories.map((cat, idx) => (
            <option key={cat.id ?? cat.name ?? idx} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
      <div style={formItemStyle}>
        <label htmlFor="date-select">開催日で絞り込み: </label>
        <input
          type="date"
          id="date-select"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>
      <div style={formItemStyle}>
        <label htmlFor="event-title-search">イベント名検索: </label>
        <input
          type="text"
          id="event-title-search"
          value={eventTitle || ""}
          onChange={(e) => setEventTitle && setEventTitle(e.target.value)}
          placeholder="イベント名で検索"
        />
      </div>
      <div style={formItemStyle}>
        <label htmlFor="keyword-search">キーワード検索: </label>
        <input
          type="text"
          id="keyword-search"
          value={keyword || ""}
          onChange={(e) => setKeyword && setKeyword(e.target.value)}
          placeholder="キーワードで検索"
        />
      </div>
      <div style={formItemStyle}>
        <label>
          <input
            type="checkbox"
            checked={hideExpired}
            onChange={e => setHideExpired(e.target.checked)}
          />
          申込期間内のイベントのみ表示
        </label>
      </div>
      <div style={formItemStyle}>
        <button type="button" onClick={handleReset}>
          リセット
        </button>
      </div>
    </div>
  );
}

// スタイル分離
const searchFormWrapperStyle = {
  border: "1px solid #1976d2",
  borderRadius: "8px",
  boxShadow: "0 1px 4px #1976d220",
  padding: "0.2rem",
  margin: "0.2rem 0",
  background: "#f7faff",
  fontSize: "0.78rem",
  maxWidth: "320px",
};

const formItemStyle = {
  marginBottom: "0.15rem",
  display: "flex",
  alignItems: "center",
  gap: "0.15rem",
};

const clearButtonStyle = {
  fontSize: "0.7rem",
  padding: "0.1rem 0.4rem",
  marginLeft: "0.3rem",
  border: "1px solid #1976d2",
  borderRadius: "4px",
  background: "#fff",
  color: "#1976d2",
  cursor: "pointer"
};