import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getValidId } from "../../utils/getValidId";
import { useEventsData } from "../../hooks/useEventsData";
import { toggleFavorite } from "../../utils/toggleFavorite";
import { filterEvents } from "../../utils/filterEvents";
import EventSearchHeader from "../../components/EventSearchHeader";
import EventResultTable from "../../components/EventResultTable";

export default function EventsPage() {
  const [id, setId] = useState(null);
  const [sortKey, setSortKey] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [keyword, setKeyword] = useState("");
  const [eventTitle, setEventTitle] = useState(""); // イベント名検索用
  const [hideExpired, setHideExpired] = useState(true);
  const [searchOpen, setSearchOpen] = useState(true);
  const [participatedEvents, setParticipatedEvents] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const validId = getValidId();
    if (!validId) {
      router.push("/login");
      return;
    }
    setId(validId);
  }, [router]);

  // 参加済みイベント取得
  useEffect(() => {
    if (!id) return;
    fetch(`https://0x0-participation-test.azurewebsites.net/api/reservation-history?code=exW-o4MDMd1st0v3s80m78npZI9eFDO5oC0USpOh-_qlAzFuCQyxhQ%3D%3D`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      }
    )
      .then(res => res.json())
      .then(data => {
        setParticipatedEvents(Array.isArray(data) ? data.map(ev => ev.event_id) : []);
      })
      .catch(() => setParticipatedEvents([]));
  }, [id]);

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
    await toggleFavorite(eventId);
    // API成功後にお気に入りリストを再取得するなどの処理を追加
    // 例: setFavorites([...favorites, eventId]);
  };

  // 参加キャンセル処理
  async function handleCancelParticipation(eventId) {
    if (!window.confirm("本当に参加をキャンセルしますか？")) return;
    try {
      const res = await fetch("https://0x0-participation-test.azurewebsites.net/api/cancel-participation?code=lg6z2CItkdkWJ01FZGSTMb0W0e7HfGW9hHGRwMsq_bpFAzFuADr_nQ%3D%3D", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: eventId, id })
      });
      if (res.ok) {
        alert("キャンセルしました");
        setParticipatedEvents(prev => prev.filter(eid => eid !== eventId));
      } else {
        alert("キャンセルに失敗しました");
      }
    } catch (e) {
      alert("通信エラーが発生しました");
    }
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
        participatedEvents={participatedEvents}
        onCancelParticipation={handleCancelParticipation}
      />
    </div>
  );
}