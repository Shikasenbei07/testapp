import React from "react";

export default function EventForm({
    form,
    errors,
    preview,
    eventData,
    categoryOptions,
    keywordOptions,
    isEdit,
    onChange,
    onSubmit,
    onDraft,
    isFormComplete,
    submitLabel = "作成",
    draftLabel = "下書き保存"
}) {
    return (
        <div className="event-form-container">
            <h1>{isEdit ? "イベント編集" : "イベント作成"}</h1>
            <form onSubmit={onSubmit}>
                <div className="row" style={styles.row}>
                    <label style={styles.label}>タイトル
                        <input type="text" name="title" value={form.title} onChange={onChange} required maxLength={255} style={styles.input} />
                    </label>
                    {errors.title && <div style={{ color: 'red' }}>{errors.title}</div>}
                </div>
                <div className="row" style={styles.row}>
                    <label style={styles.label}>日付
                        <input type="datetime-local" name="date" value={form.date} onChange={onChange} required min={new Date().toISOString().slice(0, 16)} style={styles.input} />
                    </label>
                    {errors.date && <div style={{ color: 'red' }}>{errors.date}</div>}
                </div>
                <div className="row" style={styles.row}>
                    <label style={styles.label}>場所
                        <input type="text" name="location" value={form.location} onChange={onChange} required maxLength={255} style={styles.input} />
                    </label>
                    {errors.location && <div style={{ color: 'red' }}>{errors.location}</div>}
                </div>
                <div className="row" style={styles.row}>
                    <label style={styles.label}>カテゴリ
                        <select name="category" value={form.category} onChange={onChange} required style={styles.select}>
                            <option value="">選択してください</option>
                            {categoryOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </label>
                    {errors.category && <div style={{ color: 'red' }}>{errors.category}</div>}
                </div>
                <div className="row">
                    <label>キーワード</label>
                    <div className="keyword-wrap">
                        {keywordOptions.map(opt => (
                            <label key={opt.value} className="keyword-label">
                                <input
                                    type="checkbox"
                                    name="keywords"
                                    value={opt.value}
                                    checked={form.keywords.includes(opt.value) || form.keywords.includes(String(opt.value))}
                                    onChange={onChange}
                                    style={styles.checkbox}
                                />
                                {opt.label}
                            </label>
                        ))}
                    </div>
                    {errors.keywords && <div style={{ color: 'red' }}>{errors.keywords}</div>}
                </div>
                <div className="row" style={styles.row}>
                    <label style={styles.label}>画像
                        <input type="file" name="image" accept="image/*" onChange={onChange} style={styles.input} />
                    </label>
                    {(preview && form.image && typeof form.image !== "string") && (
                        <img src={preview} alt="プレビュー" className="event-image" />
                    )}
                    {(!preview && eventData && eventData.image_url) && (
                        <img src={eventData.image_url} alt="保存済み画像" className="event-image" />
                    )}
                    {errors.image && <div style={{ color: 'red' }}>{errors.image}</div>}
                </div>
                <div className="row" style={styles.row}>
                    <label style={styles.label}>イベント概要
                        <textarea name="summary" rows={3} maxLength={200} value={form.summary} onChange={onChange} required style={styles.textarea} />
                    </label>
                    {errors.summary && <div style={{ color: 'red' }}>{errors.summary}</div>}
                </div>
                <div className="row" style={styles.row}>
                    <label style={styles.label}>イベント詳細
                        <textarea name="detail" rows={5} maxLength={200} value={form.detail} onChange={onChange} required style={styles.textarea} />
                    </label>
                    {errors.detail && <div style={{ color: 'red' }}>{errors.detail}</div>}
                </div>
                <div className="row" style={styles.row}>
                    <label style={styles.label}>最大人数
                        <input type="number" name="max_participants" value={form.max_participants} onChange={onChange} min={1} style={styles.input} />
                    </label>
                    {errors.max_participants && <div style={{ color: 'red' }}>{errors.max_participants}</div>}
                </div>
                <div className="row" style={styles.row}>
                    <label style={styles.label}>申し込み締め切り日
                        <input type="datetime-local" name="deadline" value={form.deadline} onChange={onChange} required min={new Date().toISOString().slice(0, 16)} max={form.date || undefined} style={styles.input} />
                    </label>
                    {errors.deadline && <div style={{ color: 'red' }}>{errors.deadline}</div>}
                </div>
                <button
                    type="submit"
                    disabled={!isFormComplete()}
                    className={`submit-btn${isFormComplete() ? "" : " disabled"}`}
                >
                    {submitLabel}
                </button>
                <button type="button" className="draft-btn" onClick={onDraft}>{draftLabel}</button>
                {/* 
                {isEdit && (
                    <button
                        type="button"
                        className="delete-btn"
                        onClick={onDelete}
                    >{deleteLabel}</button>
                )}
                */}
            </form>
            <style jsx>{`
                .event-form-container {
                    max-width: 600px;
                    margin: 2rem auto;
                    font-family: sans-serif;
                }
                .row {
                    margin-bottom: 1.2rem;
                }
                .keyword-label {
                    display: flex;
                    align-items: center;
                    gap: 0.2rem;
                    margin: 0;
                }
                .keyword-wrap {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }
                .event-image {
                    max-width: 100%;
                    max-height: 200px;
                    margin-top: 0.5rem;
                }
                .submit-btn {
                    background: #1976d2;
                    color: #fff;
                    cursor: pointer;
                    opacity: 1;
                    border: none;
                    border-radius: 4px;
                    padding: 0.6em 1.5em;
                    font-size: 1rem;
                    font-weight: bold;
                    margin-right: 8px;
                    transition: background 0.2s, opacity 0.2s;
                }
                .submit-btn.disabled {
                    background: #ccc;
                    color: #888;
                    cursor: not-allowed;
                    opacity: 0.6;
                }
                .draft-btn {
                    margin-left: 8px;
                    background: #eee;
                    color: #333;
                    border: none;
                    border-radius: 4px;
                    padding: 0.6em 1.5em;
                    font-size: 1rem;
                    font-weight: bold;
                    cursor: pointer;
                }
                .delete-btn {
                    margin-left: 8px;
                    background: #d32f2f;
                    color: #fff;
                    border: none;
                    border-radius: 4px;
                    padding: 0.6em 1.5em;
                    font-size: 1rem;
                    font-weight: bold;
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
}

const styles = {
  row: { marginBottom: "1.2rem" },
  label: { fontWeight: "bold", marginBottom: 4, display: "block" },
  input: { width: "100%", padding: "8px", marginTop: "4px" },
  select: { width: "100%", padding: "8px", marginTop: "4px" },
  checkbox: { marginRight: "4px" },
  textarea: { width: "100%", padding: "8px", marginTop: "4px" }
};
