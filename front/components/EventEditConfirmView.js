import React from "react";
import { formatDateTime } from "../utils/formatDateTime"; // 日付フォーマット関数をインポート（パスは適宜修正）

export default function EventEditConfirmView({
    formValues,
    categoryName,
    keywordNames,
    loading,
    error,
    onConfirm,
    onBack
}) {
    if (!formValues) {
        return <div>読み込み中...</div>;
    }

    // 画像プレビュー用
    let imagePreview = null;
    if (formValues.image instanceof File) {
        imagePreview = URL.createObjectURL(formValues.image);
    } else if (typeof formValues.image === "string" && formValues.image) {
        imagePreview = formValues.image; // 既存画像URL
    }

    return (
        <div style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "sans-serif" }}>
            <h1>イベント編集内容確認</h1>
            <div style={{ margin: "1rem 0", fontWeight: "bold", color: "#1976d2" }}>この内容でイベントを更新します。よろしいですか？</div>
            <div className="row"><b>タイトル:</b> {formValues.title}</div>
            <div className="row"><b>日付:</b> {formValues.date ? formatDateTime(formValues.date) : ""}</div>
            <div className="row"><b>場所:</b> {formValues.location}</div>
            <div className="row"><b>カテゴリ:</b> {categoryName || ""}</div>
            <div className="row">
                <b>キーワード:</b>{" "}
                {Array.isArray(keywordNames)
                    ? keywordNames.filter(Boolean).join(", ")
                    : (keywordNames || "")}
            </div>
            <div className="row"><b>概要:</b> {formValues.summary}</div>
            <div className="row"><b>詳細:</b> {formValues.detail}</div>
            <div className="row"><b>最大人数:</b> {formValues.max_participants}</div>
            <div className="row"><b>締切日:</b> {formValues.deadline ? formatDateTime(formValues.deadline) : ""}</div>
            <div className="row">
                <b>画像:</b><br />
                {imagePreview ? (
                    <img
                        src={imagePreview}
                        alt="イベント画像"
                        style={{ maxWidth: "100%", maxHeight: 200, marginTop: 8, border: "1px solid #ccc" }}
                    />
                ) : (
                    <span>画像なし</span>
                )}
            </div>
            {error && <div style={{ color: "red" }}>{error}</div>}
            <button
                onClick={onConfirm}
                disabled={loading}
                style={{ background: "#1976d2", color: "#fff", marginTop: 16 }}
            >
                {loading ? "更新中..." : "この内容で更新"}
            </button>
            <button
                type="button"
                style={{ marginLeft: 8 }}
                onClick={onBack}
            >戻る</button>
        </div>
    );
}