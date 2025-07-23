import { useFavorites } from "../../hooks/useFavorites";
import FavoritesPageContainer from "../../components/FavoritesPageContainer";

export default function FavoritesPage() {
  const { favorites, setFavorites, loading } = useFavorites();

  return (
    <FavoritesPageContainer
      favorites={favorites}
      setFavorites={setFavorites}
      loading={loading}
    />
  );
}