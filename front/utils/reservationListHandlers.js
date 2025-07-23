export function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate());
  const hour = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${year}年${month}月${day}日${hour}時${min}分`;
}

export async function handleCancelReservation({ event_id, userId, fetchHistory, showCustomAlert, setConfirmId, setCanceling }) {
  setCanceling(true);
  try {
    const res = await fetch("https://0x0-history2-dwcdfzgnc0gygud2.japaneast-01.azurewebsites.net/api/cancel-participation?code=2w2yTWReAwYkW2QnECrJYVsSD4s4g-qx-OTAufJIMJ9rAzFuTaTVzA%3D%3D", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_id, user_id: userId })
    });
    if (res.ok) {
      fetchHistory();
      showCustomAlert("キャンセルしました");
      setConfirmId(null);
    } else {
      const msg = await res.text();
      showCustomAlert(msg || "キャンセルに失敗しました");
    }
  } catch {
    showCustomAlert("通信エラーが発生しました");
  }
  setCanceling(false);
}