import React from "react";
import { useState } from "react";
import { useReservationList } from "../hooks/useReservationList";
import { cancelReservation } from "../utils/reservationListHandlers";

export default function EventResultTable({
  events,
  favorites,
  filteredKeys,
  sortKey,
  sortOrder,
  selectedCategory,
  selectedDate,
  keyword,
  hideExpired,
  toggleFavorite,
}) {
  // useReservationListから参加済みイベントID一覧とfetchHistoryを取得
  const { history: reservationList, fetchHistory } = useReservationList();
  const participatedEventIds = reservationList?.map(r => String(r.event_id)) ?? [];

  const [canceling, setCanceling] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  // フィルタ・ソート処理はそのまま
  const filteredEvents = [...events]
    .filter(ev => !selectedCategory || String(ev.event_category) === String(selectedCategory))
    .filter(ev => !selectedDate || (ev.event_datetime && ev.event_datetime.slice(0,10) === selectedDate))
    .filter(ev => {
      if (!keyword) return true;
      if (!Array.isArray(ev.keywords) || ev.keywords.length === 0) return false;
      return ev.keywords.some(kw =>
        (kw.keyword_name || kw).toLowerCase().includes(keyword.toLowerCase())
      );
    })
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
    });

  return (
    <div className="event-card-list">
      {filteredEvents.map((event, idx) => {
        const now = new Date();
        const isExpired = event.deadline && new Date(event.deadline) < now;
        const isFull = event.max_participants !== undefined && event.current_participants >= event.max_participants;
        const userId = localStorage.getItem("id");
        const isParticipated = participatedEventIds.includes(String(event.event_id));
        const isThisCanceling = canceling && confirmId === event.event_id;

        return (
          <div
            className="event-card"
            key={idx}
            onClick={() => window.location.href = `/event/detail/${event.event_id}`}
            style={{ cursor: "pointer" }}
          >
            <div className="event-card-image">
              {event.image ? (
                <img
                  src={event.image}
                  alt="イベント画像"
                  style={{ maxWidth: 120, maxHeight: 120, objectFit: "cover", border: "1px solid #ccc", borderRadius: 8 }}
                />
              ) : (
                <span style={{ display: "inline-block", width: 120, height: 120, background: "#eee", borderRadius: 8 }} />
              )}
            </div>
            <div className="event-card-content">
              {filteredKeys.map((key, i) => {
                if (key === "deadline") {
                  const isExpired = event[key] && new Date(event[key]) < new Date();
                  return (
                    <div key={i} style={{ color: isExpired ? "red" : undefined }}>
                      <b>申し込み期限:</b> {event[key] ? event[key].replace(/:\d{2}$/, "") : event[key]}
                    </div>
                  );
                }
                if (key === "event_title") {
                  return (
                    <div key={i} style={{ fontWeight: "bold", fontSize: "1.2em", marginBottom: 4 }}>
                      {event[key]}
                    </div>
                  );
                }
                if (key === "event_datetime") {
                  return (
                    <div key={i}>
                      <b>開催日時:</b> {event[key] ? event[key].replace(/:\d{2}$/, "") : event[key]}
                    </div>
                  );
                }
                if (key === "location") {
                  return (
                    <div key={i}>
                      <b>場所:</b> {event[key]}
                    </div>
                  );
                }
                // その他の項目
                return (
                  <div key={i}>
                    <b>{key}:</b> {event[key]}
                  </div>
                );
              })}
              <div>
                <b>参加人数状況:</b> {`${event.current_participants ?? 0}/${event.max_participants ?? 0}`}
              </div>
              <div style={{ marginTop: 8 }}>
                <button
                  className={favorites.some(fav => String(fav.event_id) === String(event.event_id)) ? "favorite active" : "favorite"}
                  onClick={e => {
                    e.stopPropagation();
                    toggleFavorite(event.event_id);
                  }}
                >
                  ★
                </button>
                {(() => {
                  if (event.creator === userId) {
                    return (
                      <button
                        onClick={e => { e.stopPropagation(); window.location.href = `/event/edit?event_id=${event.event_id}`; }}
                        style={{
                          background: "#ffa000",
                          color: "#fff",
                          border: "none",
                          borderRadius: 4,
                          padding: "6px 16px",
                          cursor: "pointer"
                        }}
                      >
                        編集
                      </button>
                    );
                  } else if (isExpired) {
                    return (
                      <button
                        disabled
                        style={{
                          background: "#ccc",
                          color: "#888",
                          border: "none",
                          borderRadius: 4,
                          padding: "6px 16px",
                          cursor: "not-allowed"
                        }}
                      >
                        期限切れ
                      </button>
                    );
                  } else if (isParticipated) {
                    return (
                      <button
                        disabled={isThisCanceling}
                        onClick={async (e) => {
                          e.stopPropagation();
                          // 確認アラートを表示
                          if (!window.confirm("本当にこのイベントの参加をキャンセルしますか？")) {
                            return;
                          }
                          setConfirmId(event.event_id);
                          await cancelReservation({
                            event_id: event.event_id,
                            userId: localStorage.getItem("id"),
                            fetchHistory,
                            showCustomAlert: () => {},
                            setConfirmId,
                            setCanceling
                          });
                          // fetchHistoryでリストが更新されるのでボタンも自動で変化
                        }}
                        style={{
                          background: isThisCanceling ? "#aaa" : "#f43f5e",
                          color: "#fff",
                          border: "none",
                          borderRadius: 4,
                          padding: "6px 16px",
                          cursor: isThisCanceling ? "not-allowed" : "pointer"
                        }}
                      >
                        {isThisCanceling ? "キャンセル中..." : "参加キャンセル"}
                      </button>
                    );
                  } else if (isFull) {
                    return (
                      <button
                        disabled
                        style={{
                          background: "#ffc107",
                          color: "#888",
                          border: "none",
                          borderRadius: 4,
                          padding: "6px 16px",
                          cursor: "not-allowed"
                        }}
                      >
                        キャンセル待ち
                      </button>
                    );
                  } else {
                    return (
                      <button
                        onClick={e => { e.stopPropagation(); window.location.href = `/event/participation?event_id=${event.event_id}`; }}
                        style={{
                          background: "#43a047",
                          color: "#fff",
                          border: "none",
                          borderRadius: 4,
                          padding: "6px 16px",
                          cursor: "pointer"
                        }}
                      >
                        参加
                      </button>
                    );
                  }
                })()}
              </div>
            </div>
          </div>
        );
      })}
      <style jsx>{`
        .event-card-list {
          display: flex;
          flex-wrap: wrap;
          gap: 24px;
          width: 100%;
        }
        .event-card {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          background: #fff;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          box-shadow: 0 2px 12px #0001;
          padding: 18px 24px;
          box-sizing: border-box;
          width: calc(33.333% - 16px); /* 3列、gap考慮 */
          min-width: 320px;
          max-width: 100%;
        }
        @media (max-width: 1100px) {
          .event-card {
            width: calc(50% - 12px); /* 2列 */
          }
        }
        @media (max-width: 700px) {
          .event-card {
            width: 100%; /* 1列 */
            min-width: 0;
          }
        }
        .event-card-image {
          margin-right: 18px;
        }
        .event-card-content {
          flex: 1;
        }
        .favorite {
          color: #aaa;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          transition: color 0.2s;
        }
        .favorite.active {
          color: #ffcc00;
          text-shadow: 0 0 8px #ffcc00;
        }
      `}</style>
    </div>
  );
}

