import React from "react";

export default function InquiryForm({
  eventTitle,
  creatorName,
  title,
  setTitle,
  content,
  setContent,
  error,
  submitting,
  handleSubmit,
  handleBack
}) {
  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: 20 }}>
      <h1>お問い合わせページ</h1>
      <div style={{ marginBottom: 16 }}>
        <div>イベント名: <b>{eventTitle || "取得中..."}</b></div>
        <div>主催者: <b>{creatorName || "取得中..."}</b></div>
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