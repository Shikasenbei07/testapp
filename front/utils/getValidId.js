export function getValidId() {
  if (typeof window === "undefined") return null; // SSR対策

  const id = localStorage.getItem("id");
  const expire = localStorage.getItem("id_expire");

  // expireがnullまたは数値変換できない場合は無効
  const expireNum = Number(expire);
  if (
    !id ||
    !expire ||
    isNaN(expireNum) ||
    Date.now() > expireNum
  ) {
    localStorage.removeItem("id");
    localStorage.removeItem("id_expire");
    return null;
  }
  return id;
}