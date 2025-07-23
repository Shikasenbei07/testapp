import { useEffect, useState } from "react";

export default function EventDetailActions({ event_id, event, router }) {
  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("id");
    if (userId && event && event.creator_id && String(userId) === String(event.creator_id)) {
      setIsCreator(true);
    } else {
      setIsCreator(false);
    }
  }, [event]);

  return (
    <div>
      <button style={backButtonStyle} onClick={() => router.push(`/event`)}>戻る</button>
      {!isCreator ? (
        <>
          <button
            style={participateButtonStyle}
            onClick={() => router.push(`/event/participation?event_id=${event_id}`)}
          >
            参加
          </button>
          <button
            style={inquiryButtonStyle}
            onClick={() => router.push(`/inquiry/new?event_id=${event_id}`)}
          >
            問い合わせる
          </button>
        </>
      ) : (
        <button
          style={inquiryButtonStyle}
          onClick={() => router.push(`/event/edit?event_id=${event_id}`)}
        >
          編集する
        </button>
      )}
    </div>
  );
}

// --- スタイル定義 ---
const backButtonStyle = {
  background: "#eee",
  color: "#333",
  padding: "0.5rem 1.5rem",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer"
};

const participateButtonStyle = {
  marginLeft: '1rem',
  background: '#1976d2',
  color: 'white',
  padding: '0.5rem 1.5rem',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
};

const inquiryButtonStyle = {
  marginLeft: '1rem',
  background: '#43a047',
  color: 'white',
  padding: '0.5rem 1.5rem',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
};