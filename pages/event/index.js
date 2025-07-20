import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getValidId } from "../../utils/getValidId";
import { FilterPanel } from "../../components/filterPanel";
import { EventsTable } from "../../components/EventsTable";
import { useCategories } from "../../utils/useCategories";
import { getCategories } from "../../utils/getCategories";

const isLocal = process.env.NEXT_PUBLIC_IS_LOCAL === "true";
const API_URL_SEARCH_EVENTS = process.env.NEXT_PUBLIC_API_URL_SEARCH_EVENTS;

export default function EventsPage() {
  const [favorites, setFavorites] = useState([]);
  const [id, setId] = useState(null);
  const [sortKey, setSortKey] = useState("");       // ここが抜けている可能性大
  const [sortOrder, setSortOrder] = useState("asc"); // ここも
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [keyword, setKeyword] = useState("");
  const [hideExpired, setHideExpired] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const validId = getValidId();
    if (!validId) {
      router.push("/login");
      return;
    }
    setId(validId);

    async function fetchCategories() {
      const cats = await getCategories();
      setCategories(cats);
    }
    fetchCategories();

    const params = new URLSearchParams();
    if (selectedCategory) params.append("category", selectedCategory);
    if (selectedDate) params.append("date", selectedDate);
    if (keyword) params.append("keyword", keyword);
    if (sortKey) params.append("sortKey", sortKey);
    if (sortOrder) params.append("sortOrder", sortOrder);

    const url = isLocal ? `${API_URL_SEARCH_EVENTS}?${params.toString()}` : `${API_URL_SEARCH_EVENTS}&${params.toString()}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch((err) => console.error("Error fetching events:", err));
  }, [selectedCategory, selectedDate, keyword, sortKey, sortOrder]);


  const router = useRouter();

  const toggleFavorite = (eventId) => {
    setFavorites(prev => {
      if (prev.includes(eventId)) {
        return prev.filter(id => id !== eventId);
      } else {
        return [...prev, eventId];
      }
    });
  };

  return (
    <div>
      <div style={{ padding: "2rem" }}>
        <h1>イベント一覧</h1>

        <FilterPanel
          sortKey={sortKey} setSortKey={setSortKey}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
          selectedDate={selectedDate} setSelectedDate={setSelectedDate}
          keyword={keyword} setKeyword={setKeyword}
        />

        {error && <div style={{ color: "red" }}>{error}</div>}

        <EventsTable
          events={events}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          sortKey={sortKey}
          sortOrder={sortOrder}
          selectedCategory={selectedCategory}
          selectedDate={selectedDate}
          keyword={keyword}
          hideExpired={hideExpired}
        />
      </div>
    </div>
  );
}
