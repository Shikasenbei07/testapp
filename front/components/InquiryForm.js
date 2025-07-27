import { useEvents } from "../hooks/useEvents";
import { useState } from "react";

const API_URL_CREATE_INQUIRY = process.env.NEXT_PUBLIC_API_URL_CREATE_INQUIRY;

export default function InquiryForm({ eventId }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { event, loading, error } = useEvents(eventId);
  const id = typeof window !== "undefined" ? localStorage.getItem("id") : null;
  const creatorId = event?.creator_id;

  if (!eventId) {
    return <div>イベントIDが指定されていません。</div>;
  }
  if (loading) {
    return <div>イベント情報取得中...</div>;
  }
  if (!event) {
    return <div>イベント情報が取得できませんでした。</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    console.log("Submitting inquiry:", JSON.stringify({
          inquiry_id: null,
          event_id: eventId,
          subject: title,
          main_text: content,
          recipient: creatorId,
          sender: id
        }));
    try {
      const result = await fetch(API_URL_CREATE_INQUIRY, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inquiry_id: null,
          event_id: eventId,
          subject: title,
          main_text: content,
          recipient: creatorId,
          sender: id
        }),
      });
      const data = await result.json();

      if (!result.ok) {
        throw new Error("送信に失敗しました。" + data.error);
      }

      alert(data.message);
      setTitle("");
      setContent("");
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    window.location.href = `/event/detail/${eventId}`;
  };

  if (creatorId === id) {
    return (
      <div>
        自分が主催者のイベントにはお問い合わせできません。
        <div style={{ marginTop: 16 }}>
          <button type="button" onClick={handleBack}>
            戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: 20 }}>
      <h1>お問い合わせページ</h1>
      <div style={{ marginBottom: 16 }}>
        <div>
          イベント名: <b>{event.event_title}</b>
        </div>
        <div>
          主催者: <b>{event.creator_name}</b>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 8 }}>
          <label>件名: <br />
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{ width: "100%" }}
              maxLength={200}
              required
              disabled={submitting}
            />
          </label>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>本文: <br />
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              style={{ width: "100%", height: 100 }}
              maxLength={2000}
              required
              disabled={submitting}
            />
          </label>
        </div>
        {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
        <button 
          type="submit" 
          style={{ marginRight: 8 }} 
          disabled={submitting}
        >
          {submitting ? "送信中..." : "送信"}
        </button>
        <button 
          type="button" 
          onClick={handleBack}
          disabled={submitting}
        >
          戻る
        </button>
      </form>
    </div>
  );
}