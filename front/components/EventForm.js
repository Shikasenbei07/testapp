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
    onDelete,
    isFormComplete,
    submitLabel = "作成",
    draftLabel = "下書き保存",
    deleteLabel = "イベント取り消し"
}) {
    // スタイル定義
    const styles = {
        container: {
            maxWidth: 600,
            margin: "2rem auto",
            fontFamily: "'Montserrat', 'Noto Sans JP', 'Helvetica Neue', Arial, 'メイリオ', sans-serif",
            background: "#fff",
            borderRadius: 18,
            // boxShadowとborderを削除して二重枠を防ぐ
            padding: "2.5em 2em"
        },
        row: {
            marginBottom: "1.5em",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start"
        },
        label: {
            fontSize: "1.08em",
            color: "#5a5af0",
            fontWeight: 700,
            marginBottom: "0.5em",
            letterSpacing: "0.06em",
            textAlign: "left",
            display: "block"
        },
        keywordLabel: {
            fontSize: "1.08em",
            color: "#7f5af0",
            fontWeight: 700,
            marginBottom: "0.5em",
            letterSpacing: "0.06em",
            textAlign: "left",
            display: "flex",
            alignItems: "center",
            gap: "0.4em"
        },
        keywordWrap: {
            display: "flex",
            flexWrap: "wrap",
            gap: "0.7em 1.2em",
            marginBottom: "1em"
        },
        image: { maxWidth: "100%", maxHeight: 200, marginTop: "0.5rem", borderRadius: "10px", boxShadow: "0 2px 12px #b4b4d820" },
        submitBtn: (enabled) => ({
            background: enabled ? "linear-gradient(90deg, #5a5af0 0%, #b4b4d8 100%)" : "#ccc",
            color: enabled ? "#fff" : "#888",
            cursor: enabled ? "pointer" : "not-allowed",
            opacity: enabled ? 1 : 0.6,
            border: "none",
            borderRadius: "8px",
            padding: "0.8em 2em",
            fontWeight: "bold",
            fontSize: "1.1em",
            letterSpacing: "0.08em",
            boxShadow: enabled ? "0 2px 12px #b4b4d820" : "none",
            marginRight: "0.7em"
        }),
        draftBtn: {
            marginLeft: 8,
            background: "#e0e7ef",
            color: "#23263a",
            border: "1.5px solid #b4b4d8",
            borderRadius: "8px",
            padding: "0.8em 2em",
            fontWeight: "bold",
            fontSize: "1.05em",
            cursor: "pointer",
            boxShadow: "0 2px 8px #b4b4d820",
            letterSpacing: "0.05em"
        },
        deleteBtn: {
            marginLeft: 8,
            background: "#f43f5e",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "0.8em 2em",
            fontWeight: "bold",
            fontSize: "1.05em",
            cursor: "pointer",
            boxShadow: "0 2px 8px #f43f5e40",
            letterSpacing: "0.05em"
        },
        select: {
            fontSize: "1.08em",
            padding: "0.5em 1em",
            borderRadius: "8px",
            border: "1.5px solid #b4b4d8",
            background: "#f8fafc",
            marginBottom: "1em"
        },
        input: {
            fontSize: "1.08em",
            padding: "0.5em 1em",
            borderRadius: "8px",
            border: "1.5px solid #b4b4d8",
            background: "#f8fafc",
            marginBottom: "0.5em"
        },
        textarea: {
            fontSize: "1.08em",
            padding: "0.5em 1em",
            borderRadius: "8px",
            border: "1.5px solid #b4b4d8",
            background: "#f8fafc",
            marginBottom: "0.5em",
            width: "100%",           // 横幅を最大に
            minWidth: "340px",       // 最小幅も広めに
            maxWidth: "100%"         // 最大幅も親に合わせる
        },
        checkbox: {
            transform: "scale(1.2)",
            marginRight: "0.5em"
        }
    };

    return (
        <div style={styles.container}>
            {/* タイトルは親で制御するため削除 */}
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
                <div className="row" style={styles.row}>
                    <label style={styles.keywordLabel}>キーワード</label>
                    <div style={styles.keywordWrap}>
                        {keywordOptions.map(opt => (
                            <label key={opt.value} style={styles.keywordLabel}>
                                <input
                                    type="checkbox"
                                    name="keywords"
                                    value={opt.value}
                                    checked={form.keywords.includes(opt.value)}
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
                        <img src={preview} alt="プレビュー" style={styles.image} />
                    )}
                    {(!preview && eventData && eventData.image_url) && (
                        <img src={eventData.image_url} alt="保存済み画像" style={styles.image} />
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
                    style={styles.submitBtn(isFormComplete())}
                >
                    {submitLabel}
                </button>
                <button type="button" style={styles.draftBtn} onClick={onDraft}>{draftLabel}</button>
                {/*
                {isEdit && (
                    <button
                        type="button"
                        style={styles.deleteBtn}
                        onClick={onDelete}
                    >{deleteLabel}</button>
                )}
                */}
            </form>
        </div>
    );
}
