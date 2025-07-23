export function handleDetail(router, item) {
  router.push({
    pathname: "/reservation-detail",
    query: {
      event_id: item.event_id,
      event_title: item.event_title ?? "",
      event_datetime: item.event_datetime ?? "",
      location: item.location ?? "",
      description: item.description ?? "",
      content: item.content ?? ""
    }
  });
}

export async function handleCancelReservation(event_id, history, setHistory) {
  if (!event_id) {
    alert("イベントIDが取得できません。");
    return;
  }
  const res = await fetch("/api/cancel-reservation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event_id })
  });
  if (res.ok) {
    alert("予約をキャンセルしました。");
    setHistory(history.filter(item => item.event_id !== event_id));
  } else {
    const errorData = await res.json();
    alert(`キャンセルに失敗しました: ${errorData.message}`);
  }
}