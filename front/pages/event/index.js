import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getValidId } from "../../utils/getValidId";
import EventSearchForm from "../../components/EventSearchForm";
import EventResultTable from "../../components/EventResultTable";

const API_URL_SEARCH_EVENTS = process.env.NEXT_PUBLIC_API_URL_SEARCH_EVENTS;
const API_URL_GET_FAVORITES = process.env.NEXT_PUBLIC_API_URL_GET_FAVORITES;
const API_URL_GET_CATEGORIES = process.env.NEXT_PUBLIC_API_URL_GET_CATEGORIES;

export default function EventsPage() {
  const [favorites, setFavorites] = useState([]);
  const [id, setId] = useState(null);
  const [sortKey, setSortKey] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
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

  useEffect(() => {
    if (!id) return;

    fetch(API_URL_GET_FAVORITES,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      }
    )
      .then(res => res.json())
      .then(data => {
        setFavorites(Array.isArray(data) ? data : []);
      })
      .catch(() => setFavorites([]));

    fetch(API_URL_SEARCH_EVENTS)
      .then((res) => res.json())
      .then((data) => {
        const now = new Date();
        const filtered = Array.isArray(data)
          ? data.filter(event => {
              if (event.is_draft === 1 || event.is_draft === "1") return false;
              if (!event.deadline) return true;
              const deadline = new Date(event.deadline);
              return deadline >= now;
            })
          : [];
        setEvents(filtered);
      })
      .catch((err) => {
        setError("データ取得エラー: " + err.message);
      });

    fetch(API_URL_GET_CATEGORIES)
      .then(res => res.json())
      .then(data => {
        setCategories(Array.isArray(data) ? data.map(cat => ({ id: cat.category_id, name: cat.category_name })) : []);
      })
      .catch(err => {
        setError("カテゴリー取得エラー: " + err.message);
      });
  }, [id]);

  const filteredKeys = ["event_title", "event_datetime", "deadline", "location"];

  const toggleFavorite = (eventId) => {
    setFavorites(prev =>
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  return (
    <div>
      <div style={stickyHeaderStyle}>
        <h1 style={eventTitleStyle}>イベント一覧</h1>
        <button
          style={searchToggleButtonStyle}
          onClick={() => setSearchOpen(o => !o)}
        >
          {searchOpen ? "▲ 検索フォームを折りたたむ" : "▼ 検索フォームを開く"}
        </button>
        {searchOpen && (
          <EventSearchForm
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
        )}
      </div>
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
        toggleFavorite={toggleFavorite}
      />
    </div>
  );
}

// スタイル分離
const stickyHeaderStyle = {
  position: "sticky",
  top: 0,
  zIndex: 100,
  background: "#fff",
  padding: "2rem",
  boxShadow: "0 2px 8px rgba(0,0,0,0.07)", // ヘッダーを強調
};

const eventTitleStyle = {
  margin: 0,
  fontSize: "1.5rem",
  fontWeight: "bold",
  color: "#1976d2"
};

const searchToggleButtonStyle = {
  marginBottom: "1rem",
  background: "#1976d2",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  padding: "0.5rem 1.2rem",
  fontWeight: "bold",
  cursor: "pointer"
};
