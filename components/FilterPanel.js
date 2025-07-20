'use client';

import { useState, useEffect } from 'react';
import { getCategories } from '../utils/getCategories';

const API_URL_GET_CATEGORIES = process.env.NEXT_PUBLIC_API_URL_GET_CATEGORIES;

export function FilterPanel({
  sortKey, setSortKey,
  sortOrder, setSortOrder,
  selectedCategory, setSelectedCategory,
  selectedDate, setSelectedDate,
  keyword, setKeyword,
}) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch('http://localhost:7071/api/get_categories')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
        } else {
          setCategories([]);
          setError('データ形式が不正です');
        }
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  return (
    <div style={{ marginBottom: "1rem" }}>
      <div>
        <label htmlFor="sort-select">並び順: </label>
        <select id="sort-select" value={sortKey} onChange={e => setSortKey(e.target.value)}>
          <option value="">選択してください</option>
          <option value="event_id">新着順</option>
          <option value="current_participants">参加者数</option>
          <option value="vacancy">空き枠順</option>
          <option value="deadline">申し込み締め切り順</option>
        </select>
        <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
          <option value="asc">昇順</option>
          <option value="desc">降順</option>
        </select>
      </div>

      <div>
        <label htmlFor="category-select">カテゴリーで絞り込み: </label>
        <select
          id="category-select"
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
        >
          <option value="">すべて</option>
          {(categories ?? []).map((cat) => (
            <option key={cat.category_id} value={cat.category_id}>
              {cat.category_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="date-select">開催日で絞り込み: </label>
        <input
          type="date"
          id="date-select"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
        />
        {selectedDate && <button onClick={() => setSelectedDate("")}>クリア</button>}
      </div>

      <div>
        <label htmlFor="keyword-search">キーワード検索: </label>
        <input
          type="text"
          id="keyword-search"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          placeholder="イベント名で検索"
        />
        {keyword && <button onClick={() => setKeyword("")}>クリア</button>}
      </div>
    </div>
  );
}
