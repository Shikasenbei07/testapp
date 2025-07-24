export function filterEvents(events, { keyword, eventTitle }) {
  if ((!keyword || keyword.trim() === "") && (!eventTitle || eventTitle.trim() === "")) {
    return events;
  }
  return events.filter(event => {
    const title = event.event_title || "";
    const kw = keyword ? keyword.trim() : "";
    const et = eventTitle ? eventTitle.trim() : "";
    return (
      (kw === "" || title.includes(kw)) &&
      (et === "" || title.includes(et))
    );
  });
}