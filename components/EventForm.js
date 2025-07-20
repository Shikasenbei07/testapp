import React from "react";

export default function EventForm({
    form,
    errors,
    preview,
    eventData,
    categoryOptions,
    keywords,
    isEdit,
    onChange,
    onSubmit,
    onDraft,
    onDelete,
    isFormComplete,
    submitLabel = "作成",
    draftLabel = "下書き保存",
    deleteLabel = "イベント取り消し"
}) {

    // フォームの onChange ラッパー（親のonChangeにイベントタイプ別のデータ渡す例）
    const handleChange = (e) => {
        const { name, type, value, checked, files } = e.target;

        if (type === "checkbox") {
            // チェックボックスの場合はcheckedを送る
            onChange({
                target: {
                    name,
                    value,
                    checked,
                }
            });
        } else if (type === "file") {
            // ファイルの場合はファイルリストを送る
            onChange({
                target: {
                    name,
                    files,
                }
            });
        } else {
            // それ以外はvalueのみ
            onChange({
                target: {
                    name,
                    value,
                }
            });
        }
    };

    const isComplete = isFormComplete();

    return (
        <div style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "sans-serif" }}>
            <h1>{isEdit ? "イベント編集" : "イベント作成"}</h1>
            <form onSubmit={onSubmit}>
                {/* タイトル */}
                <div className="row">
                    <label>タイトル
                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            required
                            maxLength={255}
                        />
                    </label>
                    {errors.title && <div style={{ color: 'red' }}>{errors.title}</div>}
                </div>

                {/* 日付 */}
                <div className="row">
                    <label>日付
                        <input
                            type="datetime-local"
                            name="date"
                            value={form.date}
                            onChange={handleChange}
                            required
                            min={new Date().toISOString().slice(0, 16)}
                        />
                    </label>
                    {errors.date && <div style={{ color: 'red' }}>{errors.date}</div>}
                </div>

                {/* 場所 */}
                <div className="row">
                    <label>場所
                        <input
                            type="text"
                            name="location"
                            value={form.location}
                            onChange={handleChange}
                            required
                            maxLength={255}
                        />
                    </label>
                    {errors.location && <div style={{ color: 'red' }}>{errors.location}</div>}
                </div>

                {/* カテゴリ */}
                <div className="row">
                    <label>カテゴリ
                        <select
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            required
                        >
                            <option value="">選択してください</option>
                            {(categoryOptions ?? []).map((cat) => (
                                <option key={cat.category_id} value={cat.category_id}>
                                {cat.category_name}
                                </option>
                            ))}
                        </select>
                    </label>
                    {errors.category && <div style={{ color: 'red' }}>{errors.category}</div>}
                </div>

                {/* キーワード */}
                <div className="row">
                    <label>キーワード</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {keywords.map(opt => (
                            <label
                                key={opt.keyword_id}
                                style={{ display: "flex", alignItems: "center", gap: "0.2rem", margin: 0 }}
                            >
                                <input
                                    type="checkbox"
                                    name="keywords"
                                    value={opt.keyword_id}
                                    checked={form.keywords.includes(opt.keyword_id)}
                                    onChange={handleChange}
                                />
                                {opt.keyword_name}
                            </label>
                        ))}
                    </div>
                    {errors.keywords && <div style={{ color: 'red' }}>{errors.keywords}</div>}
                </div>

                {/* 画像 */}
                <div className="row">
                    <label>画像
                        <input
                            type="file"
                            name="image"
                            accept="image/*"
                            onChange={handleChange}
                        />
                    </label>
                    {(preview && form.image && typeof form.image !== "string") && (
                        <img
                            src={preview}
                            alt="プレビュー"
                            style={{ maxWidth: "100%", maxHeight: 200, marginTop: "0.5rem" }}
                        />
                    )}
                    {(!preview && eventData && eventData.image_url) && (
                        <img
                            src={eventData.image_url}
                            alt="保存済み画像"
                            style={{ maxWidth: "100%", maxHeight: 200, marginTop: "0.5rem" }}
                        />
                    )}
                    {errors.image && <div style={{ color: 'red' }}>{errors.image}</div>}
                </div>

                {/* イベント概要 */}
                <div className="row">
                    <label>イベント概要
                        <textarea
                            name="summary"
                            rows={3}
                            maxLength={200}
                            value={form.summary}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    {errors.summary && <div style={{ color: 'red' }}>{errors.summary}</div>}
                </div>

                {/* イベント詳細 */}
                <div className="row">
                    <label>イベント詳細
                        <textarea
                            name="detail"
                            rows={5}
                            maxLength={200}
                            value={form.detail}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    {errors.detail && <div style={{ color: 'red' }}>{errors.detail}</div>}
                </div>

                {/* 最大人数 */}
                <div className="row">
                    <label>最大人数
                        <input
                            type="number"
                            name="max_participants"
                            value={form.max_participants}
                            onChange={handleChange}
                            min={1}
                        />
                    </label>
                    {errors.max_participants && <div style={{ color: 'red' }}>{errors.max_participants}</div>}
                </div>

                {/* 申し込み締め切り日 */}
                <div className="row">
                    <label>申し込み締め切り日
                        <input
                            type="datetime-local"
                            name="deadline"
                            value={form.deadline}
                            onChange={handleChange}
                            required
                            min={new Date().toISOString().slice(0, 16)}
                            max={form.date || undefined}
                        />
                    </label>
                    {errors.deadline && <div style={{ color: 'red' }}>{errors.deadline}</div>}
                </div>

                {/* ボタン類 */}
                <button
                    type="submit"
                    disabled={!isComplete}
                    style={{
                        background: isComplete ? "#1976d2" : "#ccc",
                        color: isComplete ? "#fff" : "#888",
                        cursor: isComplete ? "pointer" : "not-allowed",
                        opacity: isComplete ? 1 : 0.6
                    }}
                >
                    {submitLabel}
                </button>
                <button
                    type="button"
                    style={{ marginLeft: 8 }}
                    onClick={onDraft}
                >
                    {draftLabel}
                </button>
                {isEdit && (
                    <button
                        type="button"
                        style={{ marginLeft: 8, background: "#d32f2f", color: "#fff" }}
                        onClick={onDelete}
                    >
                        {deleteLabel}
                    </button>
                )}
            </form>
        </div>
    );
}
