import { useState } from "react";
import { showRemoveFavoritePopup } from "../utils/favoriteHandlers";

const API_URL_REMOVE_FAVORITE = process.env.NEXT_PUBLIC_API_URL_REMOVE_FAVORITE;

export function useRemoveFavorite() {
  const [removing, setRemoving] = useState(false);

  // お気に入り解除処理（API通信もここで実施）
  const removeFavorite = async (event_id, favorites, setFavorites) => {
    const confirmed = await showRemoveFavoritePopup();
    if (!confirmed) return false;

    setRemoving(true);
    try {
      const res = await fetch(API_URL_REMOVE_FAVORITE + `?event_id=${encodeURIComponent(event_id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        // event_idが数値や文字列で混在している場合に備え、型を揃えて比較
        setFavorites(favorites.filter(item => String(item.event_id) !== String(event_id)));
        setRemoving(false);
        return true;
      } else {
        alert("解除に失敗しました");
        setRemoving(false);
        return false;
      }
    } catch (e) {
      alert("通信エラーが発生しました");
      setRemoving(false);
      return false;
    }
  };

  return { removeFavorite, removing };
}