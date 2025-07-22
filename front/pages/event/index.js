import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getValidId } from "../../utils/getValidId";
import QandA from "../../components/QandA";

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
  const router = useRouter();

  // id取得とリダイレクト
  useEffect(() => {
    const validId = getValidId();
    if (!validId) {
      router.push("/login");
      return;
    }
    setId(validId);
  }, [router]);

  // idがセットされてからのみAPIリクエスト
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
  }, [id]); // ← ここを修正: idがセットされたときのみ実行

  const filteredKeys = ["event_title", "event_datetime", "deadline", "location"];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(120deg, #e0e7ef 0%, #c7d2fe 60%, #a5b4fc 100%)", // 背景色を少し強調
      }}
    >
      <div style={{
        padding: "2.5rem 1rem",
        maxWidth: "1200px",
        margin: "0 auto",
        fontFamily: "'Share Tech Mono', 'Fira Mono', 'Consolas', monospace"
      }}>
        <h1 style={{
          color: "#5a5af0",
          fontWeight: 900,
          fontSize: "2.8em",
          letterSpacing: "0.12em",
          marginBottom: "2.2rem",
          textShadow: "0 6px 24px #b4b4d880, 0 1px 0 #fff", // 影を強調
          textAlign: "center",
          fontFamily: "'Bebas Neue', 'Montserrat', 'Share Tech Mono', 'Fira Mono', 'Consolas', monospace",
          textTransform: "uppercase",
          lineHeight: 1.1,
          letterSpacing: "0.15em"
        }}>
          イベント一覧
        </h1>
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1.5em",
          marginBottom: "2em",
          alignItems: "center",
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 2px 12px #b4b4d820",
          padding: "1.2em 1.5em"
        }}>
          <div style={{ minWidth: 180 }}>
            <label htmlFor="sort-select">並び順: </label>
            <select
              id="sort-select"
              value={sortKey}
              onChange={e => setSortKey(e.target.value)}
              style={{
                padding: "0.4em 1em",
                borderRadius: "6px",
                border: "1px solid #b4b4d8",
                background: "#f8fafc"
              }}
            >
              <option value="">選択してください</option>
              <option value="event_id">新着順</option>
              <option value="current_participants">参加者数</option>
              <option value="vacancy">空き枠順</option>
              <option value="deadline">申し込み締め切り順</option>
            </select>
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value)}
              style={{
                marginLeft: "0.5em",
                padding: "0.4em 1em",
                borderRadius: "6px",
                border: "1px solid #b4b4d8",
                background: "#f8fafc"
              }}
            >
              <option value="asc">昇順</option>
              <option value="desc">降順</option>
            </select>
          </div>
          <div style={{ minWidth: 220 }}>
            <label htmlFor="category-select">カテゴリー: </label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              style={{
                padding: "0.4em 1em",
                borderRadius: "6px",
                border: "1px solid #b4b4d8",
                background: "#f8fafc"
              }}
            >
              <option value="">すべて</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div style={{ minWidth: 200 }}>
            <label htmlFor="date-select">開催日: </label>
            <input
              type="date"
              id="date-select"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              style={{
                padding: "0.4em 1em",
                borderRadius: "6px",
                border: "1px solid #b4b4d8",
                background: "#f8fafc"
              }}
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate("")}
                style={{
                  marginLeft: "0.5em",
                  padding: "0.3em 1em",
                  borderRadius: "6px",
                  border: "1px solid #b4b4d8",
                  background: "#e0e7ef",
                  cursor: "pointer"
                }}
              >クリア</button>
            )}
          </div>
          <div style={{ minWidth: 220 }}>
            <label htmlFor="keyword-search">キーワード: </label>
            <input
              type="text"
              id="keyword-search"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="イベント名で検索"
              style={{
                padding: "0.4em 1em",
                borderRadius: "6px",
                border: "1px solid #b4b4d8",
                background: "#f8fafc"
              }}
            />
            {keyword && (
              <button
                onClick={() => setKeyword("")}
                style={{
                  marginLeft: "0.5em",
                  padding: "0.3em 1em",
                  borderRadius: "6px",
                  border: "1px solid #b4b4d8",
                  background: "#e0e7ef",
                  cursor: "pointer"
                }}
              >クリア</button>
            )}
          </div>
        </div>
        {error && <div style={{ color: "#f43f5e", marginBottom: "1em" }}>{error}</div>}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(420px, 1fr))", // さらに大きく
          gap: "3em",
          alignItems: "stretch",
          justifyItems: "center",
          justifyContent: "center",
        }}>
          {[...events]
            .filter(ev => !selectedCategory || String(ev.event_category) === String(selectedCategory))
            .filter(ev => !selectedDate || (ev.event_datetime && ev.event_datetime.slice(0, 10) === selectedDate))
            .filter(ev => !keyword || (ev.event_title && ev.event_title.includes(keyword)))
            .filter(ev => {
              if (!hideExpired) return true;
              if (!ev.deadline) return true;
              const now = new Date();
              const deadline = new Date(ev.deadline);
              return deadline >= now;
            })
            .sort((a, b) => {
              if (!sortKey) return 0;
              let aValue, bValue;
              if (sortKey === "vacancy") {
                aValue = (a.max_participants ?? 0) - (a.current_participants ?? 0);
                bValue = (b.max_participants ?? 0) - (b.current_participants ?? 0);
              } else if (sortKey === "deadline") {
                aValue = a.deadline ? new Date(a.deadline).getTime() : 0;
                bValue = b.deadline ? new Date(b.deadline).getTime() : 0;
              } else {
                aValue = a[sortKey] ?? 0;
                bValue = b[sortKey] ?? 0;
              }
              if (sortOrder === "asc") {
                return aValue - bValue;
              } else {
                return bValue - aValue;
              }
            })
            .map((event, idx) => (
              <div key={idx} style={{
                background: "#fff",
                borderRadius: "22px",
                boxShadow: "0 8px 32px 0 #b4b4d880, 0 2px 8px #c7d2fe80", // 立体感を強調
                padding: "2.5em 2em",
                display: "flex",
                flexDirection: "column",
                gap: "1.2em",
                border: favorites.includes(event.event_id) ? "3px solid #ffe066" : "2px solid #e0e7ef",
                position: "relative",
                width: "100%",
                maxWidth: "600px",
                minWidth: "380px",
                transition: "box-shadow 0.2s, transform 0.2s",
                textAlign: "center",
                // 立体感のために少し浮かせる
                transform: "translateY(0)",
                willChange: "transform, box-shadow",
                cursor: "pointer",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = "0 16px 48px 0 #b4b4d8cc, 0 4px 16px #c7d2fecc";
                e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = "0 8px 32px 0 #b4b4d880, 0 2px 8px #c7d2fe80";
                e.currentTarget.style.transform = "translateY(0) scale(1)";
              }}
              >
                <div style={{
                  fontWeight: "bold",
                  fontSize: "1.25em",
                  color: "#5a5af0",
                  marginBottom: "0.4em"
                }}>
                  {event.event_title}
                </div>
                <div style={{ color: "#23263a" }}>
                  <span style={{ fontWeight: "bold" }}>日時:</span> {event.event_datetime?.replace(/:\d{2}$/, "")}
                </div>
                <div style={{ color: "#23263a" }}>
                  <span style={{ fontWeight: "bold" }}>場所:</span> {event.location}
                </div>
                <div style={{ color: "#23263a" }}>
                  <span style={{ fontWeight: "bold" }}>締切:</span> {event.deadline?.replace(/:\d{2}$/, "")}
                </div>
                <div style={{ color: "#2cb67d", fontWeight: "bold" }}>
                  参加状況: {`${event.current_participants ?? 0}/${event.max_participants ?? 0}`}
                </div>
                <div style={{
                  display: "flex",
                  gap: "1em",
                  marginTop: "0.7em",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <button
                    onClick={() => window.location.href = `/event/detail/${event.event_id}`}
                    style={{
                      padding: "0.7em 1.5em",
                      borderRadius: "10px",
                      border: "1.5px solid #b4b4d8",
                      background: "#e0e7ef",
                      color: "#23263a",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "1em"
                    }}
                  >詳細</button>
                  <button
                    onClick={() => toggleFavorite(event.event_id)}
                    title="お気に入り登録"
                    style={{
                      backgroundColor: favorites.includes(event.event_id) ? '#ffe066' : '#fff',
                      border: '1.5px solid #b4b4d8',
                      fontSize: '1.7rem',
                      cursor: 'pointer',
                      padding: '6px 16px',
                      borderRadius: "10px"
                    }}
                  >
                    ★
                  </button>
                </div>
              </div>
            ))}
        </div>
        <QandA characterImg="/images/character.png" />
      </div>
    </div>
  );
}
