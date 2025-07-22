import { useEvents } from "../hooks/useEvents";
import { useState } from "react";

const isLocal = process.env.NEXT_PUBLIC_IS_LOCAL === "true";
const API_URL_CREATE_INQUIRY = process.env.NEXT_PUBLIC_API_URL_CREATE_INQUIRY;

export default function InquiryForm({  }) {
  const eventId = 2; // デフォルトのイベントIDを設定
  if (!eventId) {
    return (
      <div>
        イベントIDが指定されていません。
      </div>
    );
  }

  const { event, loading, error } = useEvents(eventId);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const result = await fetch(API_URL_CREATE_INQUIRY, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inquiry_id: null,
          event_id: eventId,
          title: title,
          content: content,
          destination: event.creator_id,
          sender: localStorage.getItem("id")
        }),
      });

      if (!result.ok) {
        throw new Error("送信に失敗しました。" + await result.text());
      }

      alert("お問い合わせを送信しました。");
      setTitle("");
      setContent("");
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    // 戻る処理
  };

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: 20 }}>
      <h1>お問い合わせページ</h1>
      <div style={{ marginBottom: 16 }}>
        <div>
          イベント名: <b>{event ? event.event_title : (loading ? "取得中..." : "未取得")}</b>
        </div>
        <div>
          主催者: <b>{event ? event.creator_name : (loading ? "取得中..." : "未取得")}</b>
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