import React from "react";

export default function EventDeleteConfirmView({
  eventData,
  loading,
  error,
  onDelete,
  onBack
}) {
  if (!eventData) {
    return <div>読み込み中...</div>;
  }

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h1>イベント削除内容確認</h1>
      <div style={{ margin: "1rem 0", fontWeight: "bold", color: "#d32f2f" }}>このイベントを本当に削除しますか？</div>
      <div className="row"><b>タイトル:</b> {eventData.event_title}</div>
      <div className="row"><b>日付:</b> {eventData.event_datetime}</div>
      <div className="row"><b>場所:</b> {eventData.location}</div>
      <div className="row"><b>カテゴリ:</b> {eventData.event_category}</div>
      <div className="row"><b>概要:</b> {eventData.description}</div>
      <div className="row"><b>詳細:</b> {eventData.content}</div>
      <div className="row"><b>最大人数:</b> {eventData.max_participants}</div>
      <div className="row"><b>締切日:</b> {eventData.deadline}</div>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <button onClick={onDelete} disabled={loading} style={{ background: "#d32f2f", color: "#fff", marginTop: 16 }}>
        {loading ? "削除中..." : "この内容で削除"}
      </button>
      <button
        type="button"
        style={{ marginLeft: 8 }}
        onClick={onBack}
      >戻る</button>
    </div>
  );
}