import React, { useEffect, useState } from "react";

export default function EventCreateConfirmView({
  formValues,
  image,
  imageName,
  categoryName,
  keywordNames,
  error,
  loading,
  onConfirm,
  onBack
}) {
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    if (image instanceof Blob) {
      const url = URL.createObjectURL(image);
      setImageUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setImageUrl(null);
    }
  }, [image]);

  if (!formValues) {
    return <div>読み込み中...</div>;
  }

  const isDraft = String(formValues.is_draft) === "1";
  const confirmText = isDraft
    ? "この内容で下書き保存します。よろしいですか？"
    : "この内容でイベントを登録します。よろしいですか？";
  const buttonText = isDraft ? "下書き保存を確定" : "イベント登録を確定";

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h1>イベント作成{isDraft ? "（下書き保存）" : "（本登録）"}確認</h1>
      <div style={{ margin: "1rem 0", fontWeight: "bold", color: "#1976d2" }}>{confirmText}</div>
      <div className="row"><b>タイトル:</b> {formValues.title}</div>
      <div className="row"><b>日付:</b> {formValues.date}</div>
      <div className="row"><b>場所:</b> {formValues.location}</div>
      <div className="row"><b>カテゴリ:</b> {categoryName || ""}</div>
      <div className="row"><b>キーワード:</b> {Array.isArray(keywordNames) ? keywordNames.join(", ") : (keywordNames || "")}</div>
      <div className="row"><b>概要:</b> {formValues.summary}</div>
      <div className="row"><b>詳細:</b> {formValues.detail}</div>
      <div className="row"><b>最大人数:</b> {formValues.max_participants}</div>
      <div className="row"><b>締切日:</b> {formValues.deadline}</div>
      <div className="row"><b>画像:</b> {
        imageUrl ? (
          <img
            src={imageUrl}
            alt={imageName || "画像"}
            style={{ maxWidth: "200px", maxHeight: "200px", border: "1px solid #ccc", marginTop: "8px" }}
          />
        ) : (
          "未設定"
        )
      }</div>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <button onClick={onConfirm} disabled={loading} style={{ background: "#1976d2", color: "#fff", marginTop: 16 }}>
        {loading ? "登録中..." : buttonText}
      </button>
      <button
        type="button"
        style={{ marginLeft: 8 }}
        onClick={onBack}
      >戻る</button>
    </div>
  );
}