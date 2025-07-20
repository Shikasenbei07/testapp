const API_URL_GET_CATEGORIES = process.env.NEXT_PUBLIC_API_URL_GET_CATEGORIES;

export async function getCategories() {
  try {
    const stored = localStorage.getItem('categories');

    // 安全なチェック
    let categories = [];
    if (stored && stored !== 'undefined') {
      categories = JSON.parse(stored);
      if (Array.isArray(categories) && categories.length > 0) {
        return categories;
      }
    }

    // 取得し直す
    const response = await fetch(
        API_URL_GET_CATEGORIES,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
    );
    if (!response.ok) throw new Error('データ取得に失敗しました');

    categories = await response.json();

    localStorage.setItem('categories', categories);
    return categories;
  } catch (error) {
    console.error('エラー:', error);
    return []; // フォールバック
  }
}

