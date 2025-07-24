export function filterEvents(events, { keyword, eventTitle }) {
  return events.filter(event => {
    // イベント名検索（部分一致・大文字小文字無視）
    const matchesTitle = eventTitle
      ? (event.event_title || "").toLowerCase().includes(eventTitle.toLowerCase())
      : true;

    // キーワード検索（部分一致・大文字小文字無視）
    const matchesKeyword = keyword
      ? Array.isArray(event.keywords) &&
        event.keywords.some(k => {
          // オブジェクト型なら keyword_name を参照、文字列型ならそのまま
          const kw = typeof k === "string" ? k : (k && k.keyword_name) ? k.keyword_name : "";
          return kw.toLowerCase().includes(keyword.toLowerCase());
        })
      : true;

    return matchesKeyword && matchesTitle;
  });
}