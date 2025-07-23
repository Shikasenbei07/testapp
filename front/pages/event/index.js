import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getValidId } from "../../utils/getValidId";
import { useEventsData } from "../../hooks/useEventsData";
import { toggleFavorite } from "../../utils/toggleFavorite";
import EventSearchHeader from "../../components/EventSearchHeader";
import EventResultTable from "../../components/EventResultTable";

export default function EventsPage() {
  const [id, setId] = useState(null);
  const [sortKey, setSortKey] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [keyword, setKeyword] = useState("");
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
  } = useEventsData(id);

  const filteredKeys = ["event_title", "event_datetime", "deadline", "location"];

  const handleToggleFavorite = (eventId) => {
    setFavorites(prev => toggleFavorite(prev, eventId));
  };

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
        hideExpired={hideExpired}
        setHideExpired={setHideExpired}
        error={error}
      />
      <EventResultTable
        events={events}
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
