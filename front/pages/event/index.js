import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getValidId } from "../../utils/getValidId";
import { useEventsData } from "../../hooks/useEventsData";
import { toggleFavorite } from "../../utils/toggleFavorite";
import { filterEvents } from "../../utils/filterEvents";
import EventSearchHeader from "../../components/EventSearchHeader";
import EventResultTable from "../../components/EventResultTable";
import { handleRemoveFavorite } from "../../utils/favoriteHandlers";
import { useFavorites } from "../../hooks/useFavorites";
import FavoritesPageContainer from "../../components/FavoritesPageContainer";

export default function EventsPage() {
  const [id, setId] = useState(null);
  const [sortKey, setSortKey] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [keyword, setKeyword] = useState("");
  const [eventTitle, setEventTitle] = useState(""); // イベント名検索用
  const [hideExpired, setHideExpired] = useState(false);
  const [searchOpen, setSearchOpen] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const validId = getValidId();
    if (!validId) {
      router.push("/login");
      return;
    }
    setId(validId);
  }, [router]);

  const {
    favorites,
    setFavorites,
    events,
    categories,
    error,
    setError,
  } = useEventsData(id, keyword, eventTitle);
  
  const filteredKeys = ["event_title", "event_datetime", "deadline", "location"];

  // イベント名またはキーワードで部分一致検索
  const filteredEvents = filterEvents(events, { keyword, eventTitle });

  const handleToggleFavorite = async (eventId) => {
    const isFavorite = favorites.some(fav => String(fav.event_id) === String(eventId));
    if (isFavorite) {
      // setFavoritesを渡す
      await handleRemoveFavorite(eventId, id, favorites, setFavorites);
    } else {
      await toggleFavorite(eventId, id);
      setFavorites([...favorites, { event_id: eventId }]);
    }
  };

  if (!favorites) {
    return <div>お気に入り情報を取得中...</div>;
  }

  return (
    <div>
      <EventSearchHeader
        searchOpen={searchOpen}
        setSearchOpen={setSearchOpen}
        sortKey={sortKey}
        setSortKey={setSortKey}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        keyword={keyword}
        setKeyword={setKeyword}
        eventTitle={eventTitle}
        setEventTitle={setEventTitle}
        hideExpired={hideExpired}
        setHideExpired={setHideExpired}
        error={error}
      />
      <EventResultTable
        events={filteredEvents}
        favorites={favorites}
        filteredKeys={filteredKeys}
        sortKey={sortKey}
        sortOrder={sortOrder}
        selectedCategory={selectedCategory}
        selectedDate={selectedDate}
        keyword={keyword}
        hideExpired={hideExpired}
        toggleFavorite={handleToggleFavorite}
      />
    </div>
  );
}