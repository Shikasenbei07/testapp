import { useFavorites } from "../../hooks/useFavorites";
import FavoritesPageContainer from "../../components/FavoritesPageContainer";

export default function FavoritesPage() {
  const { favorites, setFavorites, loading } = useFavorites();

  const RemoveFavorite = async (eventId, userId) => {
    try {
      const url = process.env.NEXT_PUBLIC_API_URL_REMOVE_FAVORITE;
      const method = 'DELETE';
      // event_idを数値に変換
      const body = JSON.stringify({ event_id: Number(eventId), id: userId });

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      });
      if (!response.ok) {
        throw new Error('API呼び出しに失敗しました');
      }

      // 成功時の処理
      setFavorites(prev => prev.filter(fav => Number(fav.event_id) !== Number(eventId)));
    } catch (error) {
      console.error('お気に入り削除に失敗しました:', error);
    }
  };

  return (
    <FavoritesPageContainer
      favorites={favorites}
      setFavorites={setFavorites}
      loading={loading}
      RemoveFavorite={RemoveFavorite}
    />
  );
}