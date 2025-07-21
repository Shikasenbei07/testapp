import React from "react";

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
  hideExpired,
  setHideExpired,
  error,
}) {
  return (
    <>
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
      <div style={{ marginBottom: "1rem" }}>
        <label>
          <input
            type="checkbox"
            checked={hideExpired}
            onChange={e => setHideExpired(e.target.checked)}
          />
          期限切れイベントを非表示
        </label>
      </div>
    </>
  );
}