const API_URL_GET_KEYWORDS = process.env.NEXT_PUBLIC_API_URL_GET_KEYWORDS;

export async function getKeywords() {
  try {
    const stored = localStorage.getItem('keywords');

    // 安全なチェック
    let keywords = [];
    // if (stored && stored !== 'undefined') {
    //   keywords = JSON.parse(stored);
    //   if (Array.isArray(keywords) && keywords.length > 0) {
    //     return keywords;
    //   }
    // }

    // 取得し直す
    const response = await fetch(
        API_URL_GET_KEYWORDS,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
    );
    if (!response.ok) throw new Error('データ取得に失敗しました');

    keywords = await response.json();

    localStorage.setItem('keywords', keywords);
    return keywords;
  } catch (error) {
    console.error('エラー:', error);
    return []; // フォールバック
  }
}