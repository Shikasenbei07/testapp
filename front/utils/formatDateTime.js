export function formatDateTime(dt) {
  if (!dt) return "";
  const d = new Date(dt);
  if (isNaN(d)) return dt;
  // タイムゾーンを東京（JST）に変換
  const jpDate = new Date(d.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
  const yyyy = jpDate.getFullYear();
  const mm = String(jpDate.getMonth() + 1).padStart(2, "0");
  const dd = String(jpDate.getDate()).padStart(2, "0");
  const hh = String(jpDate.getHours()).padStart(2, "0");
  const mi = String(jpDate.getMinutes()).padStart(2, "0");
  return `${yyyy}/${mm}/${dd} ${hh}:${mi}`;
}