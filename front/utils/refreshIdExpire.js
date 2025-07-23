export function refreshIdExpire() {
  if (typeof window === "undefined") return;
  const id = localStorage.getItem("id");
  if (!id) return;
  // 1時間（3600秒）延長
  const expire = Date.now() + 60 * 60 * 1000;
  localStorage.setItem("id_expire", expire);
}