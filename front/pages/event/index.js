import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getValidId } from "../../utils/getValidId";

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
  const [participatedEvents, setParticipatedEvents] = useState([]);
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

    // 参加済みイベント一覧取得
    fetch(`https://0x0-showevent-hbbadxcxh9a4bzhu.japaneast-01.azurewebsites.net/api/check_history?code=0iAKT3swTE1gEjS8rDRJWN44V-z9YG24hfRxGkLC0LmRAzFudLVqtg%3D%3D&id=${id}`)
      .then(res => res.json())
      .then(data => {
        // dataは参加済みevent_idの配列を想定
        setParticipatedEvents(Array.isArray(data) ? data : []);
      })
      .catch(() => setParticipatedEvents([]));
  }, [id]); // ← ここを修正: idがセットされたときのみ実行

  // すべてのイベントに対して参加済みかチェック
  useEffect(() => {
    if (!id || events.length === 0) return;

    // 参加済みイベント一覧取得（全イベント分をまとめて取得するAPIがない場合は、個別に判定する必要があります）
    Promise.all(
      events.map(event =>
        fetch(`https://0x0-showevent-hbbadxcxh9a4bzhu.japaneast-01.azurewebsites.net/api/check_history?code=0iAKT3swTE1gEjS8rDRJWN44V-z9YG24hfRxGkLC0LmRAzFudLVqtg%3D%3D&event_id=${event.event_id}&id=${id}`)
          .then(res => res.json())
          .then(data => (data.is_participated ? event.event_id : null))
          .catch(() => null)
      )
    ).then(results => {
      setParticipatedEvents(results.filter(eid => eid !== null));
    });
  }, [id, events]);

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
        fontFamily: "'Montserrat', 'Noto Sans JP', 'Helvetica Neue', Arial, 'メイリオ', sans-serif"
      }}>
        <h1 style={{
          color: "#5a5af0",
          fontWeight: 900,
          fontSize: "2.8em",
          letterSpacing: "0.12em",
          marginBottom: "2.2rem",
          textShadow: "0 6px 24px #b4b4d880, 0 1px 0 #fff",
          textAlign: "center",
          fontFamily: "'Bebas Neue', 'Montserrat', 'Noto Sans JP', 'Helvetica Neue', Arial, 'メイリオ', sans-serif",
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
          borderRadius: "18px",
          boxShadow: "0 4px 24px #b4b4d850, 0 2px 8px #c7d2fe80",
          padding: "1.8em 2em"
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(340px, 1fr))", // 2列固定
            gap: "2.2em",
            marginBottom: "2.5em"
          }}
        >
          {[...events]
            .filter(ev => !selectedCategory || String(ev.event_category) === String(selectedCategory))
            .filter(ev => !selectedDate || (ev.event_datetime && ev.event_datetime.slice(0,10) === selectedDate))
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
            .map((event, idx) => {
              const isParticipated = participatedEvents.includes(event.event_id);
              return (
                <div
                  key={event.event_id}
                  style={{
                    background: "#fff",
                    borderRadius: "22px",
                    boxShadow: "0 8px 32px #b4b4d880, 0 2px 8px #c7d2fe80, 0 1.5px 0 #fff",
                    padding: "2.2em 1.7em 1.7em 1.7em",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    transition: "box-shadow 0.25s, transform 0.18s",
                    border: "2.5px solid #e0e7ef",
                    minHeight: 340,
                    position: "relative",
                    cursor: "pointer",
                    willChange: "transform, box-shadow",
                    // 立体感のためのホバー効果
                    ...(window && {
                      ":hover": {
                        boxShadow: "0 16px 48px #b4b4d8cc, 0 4px 16px #c7d2fe80",
                        transform: "translateY(-6px) scale(1.025)"
                      }
                    })
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = "0 16px 48px #b4b4d8cc, 0 4px 16px #c7d2fe80";
                    e.currentTarget.style.transform = "translateY(-6px) scale(1.025)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = "0 8px 32px #b4b4d880, 0 2px 8px #c7d2fe80, 0 1.5px 0 #fff";
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  {/* --- 文字色を落ち着いた色に統一 --- */}
                  <div style={{
                    fontWeight: 900,
                    fontSize: "1.3em",
                    color: "#5a5af0", // タイトルはアクセントカラー
                    marginBottom: "0.7em",
                    letterSpacing: "0.08em",
                    textAlign: "center",
                    textShadow: "0 2px 8px #b4b4d820"
                  }}>
                    {event.event_title}
                  </div>
                  <div style={{
                    color: "#2cb67d", // 開催日時はややグリーン
                    fontWeight: 700,
                    marginBottom: "0.5em",
                    fontSize: "1.08em",
                    textAlign: "center"
                  }}>
                    開催日時: {event.event_datetime?.replace(/:\d{2}$/, "")}
                  </div>
                  <div style={{
                    color: "#f43f5e", // 申込期限はややピンク
                    fontWeight: 700,
                    marginBottom: "0.5em",
                    fontSize: "1.08em",
                    textAlign: "center"
                  }}>
                    申込期限: {event.deadline?.replace(/:\d{2}$/, "")}
                  </div>
                  <div style={{
                    color: "#7f5af0", // 開催場所は薄いパープル
                    fontWeight: 600,
                    marginBottom: "0.5em",
                    fontSize: "1.08em",
                    textAlign: "center"
                  }}>
                    開催場所: {event.location}
                  </div>
                  <div style={{
                    color: "#23263a",
                    fontWeight: 700,
                    marginBottom: "0.5em",
                    fontSize: "1.08em",
                    textAlign: "center"
                  }}>
                    参加人数: {`${event.current_participants ?? 0}/${event.max_participants ?? 0}`}
                  </div>
                  <div style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "1em",
                    marginTop: "1.2em"
                  }}>
                    <button
                      onClick={() =>
                        window.location.href =
                          `/event/detail/${event.event_id}?participated=${encodeURIComponent(isParticipated ? "1" : "0")}`
                      }
                      style={{
                        background: "linear-gradient(90deg, #5a5af0 0%, #b4b4d8 100%)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        padding: "0.6em 1.5em",
                        fontWeight: "bold",
                        fontSize: "1em",
                        cursor: "pointer",
                        boxShadow: "0 2px 8px #b4b4d820",
                        letterSpacing: "0.05em",
                        transition: "background 0.2s"
                      }}
                    >
                      詳細
                    </button>
                    <button
                      onClick={() => toggleFavorite(event.event_id)}
                      title="お気に入り登録"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        margin: 0,
                        outline: "none",
                        display: "flex",
                        alignItems: "center",
                        transition: "transform 0.15s"
                      }}
                    >
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 32 32"
                        fill={favorites.includes(event.event_id) ? "#ff6b81" : "none"}
                        stroke={favorites.includes(event.event_id) ? "#ff6b81" : "#b4b4d8"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                          filter: favorites.includes(event.event_id)
                            ? "drop-shadow(0 2px 8px #ff6b8188)"
                            : "drop-shadow(0 1px 4px #b4b4d820)",
                          transition: "fill 0.2s, stroke 0.2s, filter 0.2s",
                          transform: favorites.includes(event.event_id) ? "scale(1.15)" : "scale(1)",
                          background: "none",
                          border: "none",
                          display: "block"
                        }}
                      >
                        <path
                          d="M16 28s-9-6.2-9-13.2C7 10 9.5 7.5 12.5 7.5c1.7 0 3.3 1 4.1 2.5 0.8-1.5 2.4-2.5 4.1-2.5C22.5 7.5 25 10 25 14.8c0 7-9 13.2-9 13.2z"
                          fill={favorites.includes(event.event_id) ? "#ff6b81" : "none"}
                          stroke={favorites.includes(event.event_id) ? "#ff6b81" : "#b4b4d8"}
                        />
                      </svg>
                    </button>
                    <span style={{
                      fontWeight: 700,
                      color: isParticipated ? "#2cb67d" : "#b4b4d8",
                      fontSize: "1.3em",
                      marginLeft: "0.5em",
                      alignSelf: "center"
                    }}>
                      {isParticipated ? "参加済" : ""}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}