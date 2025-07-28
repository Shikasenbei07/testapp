const API_URL_ADD_FAVORITE = process.env.NEXT_PUBLIC_API_URL_ADD_FAVORITE;

export async function toggleFavorite(eventId) {
  const id = localStorage.getItem("id");
  try {
    const res = await fetch(
      API_URL_ADD_FAVORITE,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: eventId, id }),
      }
    );
    if (!res.ok) throw new Error("お気に入り登録失敗");
    return await res.text(); // ←ここを修正
  } catch (err) {
    alert("お気に入り登録に失敗しました");
    console.error(err);
    throw err;
  }
}