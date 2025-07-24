export function filterEvents(events, { keyword, eventTitle }) {
  if ((!keyword || keyword.trim() === "") && (!eventTitle || eventTitle.trim() === "")) {
    return events;
  }
  return events.filter(event => {
    const title = event.event_title || "";
    const kw = keyword ? keyword.trim().toLowerCase() : "";
    const et = eventTitle ? eventTitle.trim().toLowerCase() : "";

    // キーワード部分一致（keywordsはオブジェクト配列または文字列配列両対応）
    const matchesKeyword =
      kw === "" ||
      (Array.isArray(event.keywords) &&
        event.keywords.some(k =>
          (typeof k === "string" ? k : k.keyword_name || "")
            .toLowerCase()
            .includes(kw)
        ));

    // イベント名部分一致
    const matchesTitle = et === "" || title.toLowerCase().includes(et);

    return matchesKeyword && matchesTitle;
  });
}