'use client';

import { useEffect, useState } from 'react';

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);

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

  if (error) return <p>エラー: {error}</p>;

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">カテゴリ一覧</h1>
      <ul className="list-disc pl-5">
        {(categories ?? []).map((cat) => (
          <li key={cat.category_id}>
            {cat.category_id}: {cat.category_name}
          </li>
        ))}
      </ul>
    </div>
  );
}
