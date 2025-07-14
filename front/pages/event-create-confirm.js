import { useRouter } from "next/router";
import { useState } from "react";

export default function EventCreateConfirm() {
    const router = useRouter();
    // 入力データは router.query から取得（event-create.js から渡す）
    const {
        title = "",
        date = "",
        location = "",
        category = "",
        keywords: rawKeywords = [],
        summary = "",
        detail = "",
        deadline = "",
        image = null,
        max_participants = "",
        is_draft = 0
    } = router.query;
    // keywordsを配列化
    const keywords = typeof rawKeywords === "string" ? rawKeywords.split(",") : rawKeywords;

    // カテゴリ・キーワードのマスタ情報をlocalStorageから取得
    let categoryName = category;
    let keywordNames = keywords;
    try {
        const categoriesMaster = JSON.parse(localStorage.getItem("categories") || "[]");
        const keywordsMaster = JSON.parse(localStorage.getItem("keywords") || "[]");
        const foundCategory = categoriesMaster.find(c => String(c.value) === String(category));
        if (foundCategory) categoryName = foundCategory.label;
        keywordNames = keywords.map(k => {
            const found = keywordsMaster.find(kw => String(kw.value) === String(k));
            return found ? found.label : k;
        });
    } catch { }
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // 下書きか本登録か
    const isDraft = String(is_draft) === "1";
    const confirmText = isDraft
        ? "この内容で下書き保存します。よろしいですか？"
        : "この内容でイベントを登録します。よろしいですか？";
    const buttonText = isDraft ? "下書き保存を確定" : "イベント登録を確定";

    // 確定ボタンでAPI POST
    const handleConfirm = async () => {
        setLoading(true);
        setError("");
        const formData = new FormData();
        formData.append("title", title);
        formData.append("date", date);
        formData.append("location", location);
        formData.append("category", category);
        formData.append("summary", summary);
        formData.append("detail", detail);
        formData.append("deadline", deadline);
        formData.append("max_participants", max_participants);
        keywords.forEach(k => formData.append("keywords", k));
        if (image) formData.append("image", image);
        formData.append("is_draft", isDraft ? 1 : 0);
        // creatorは省略（API側で処理）
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:7071";
        const isLocal = API_BASE_URL.includes("localhost") || API_BASE_URL.includes("127.0.0.1");
        const API_EVENTS_PATH = isLocal ? "/api/events" : "/events";
        try {
            const res = await fetch(`${API_BASE_URL}${API_EVENTS_PATH}`, {
                method: "POST",
                body: formData
            });
            if (res.ok) {
                router.push(`/event-create-done?is_draft=${isDraft ? 1 : 0}`);
            } else {
                let err;
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    err = await res.json();
                } else {
                    err = { error: await res.text() };
                }
                setError("登録失敗: " + (err.error || res.status) + (err.trace ? "\n" + err.trace : ""));
            }
        } catch (err) {
            setError("通信エラー: " + err);
        }
        setLoading(false);
    };

    return (
        <div style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "sans-serif" }}>
            <h1>イベント作成{isDraft ? "（下書き保存）" : "（本登録）"}確認</h1>
            <div style={{ margin: "1rem 0", fontWeight: "bold", color: "#1976d2" }}>{confirmText}</div>
            <div className="row"><b>タイトル:</b> {title}</div>
            <div className="row"><b>日付:</b> {date}</div>
            <div className="row"><b>場所:</b> {location}</div>
            <div className="row"><b>カテゴリ:</b> {categoryName}</div>
            <div className="row"><b>キーワード:</b> {Array.isArray(keywordNames) ? keywordNames.join(", ") : keywordNames}</div>
            <div className="row"><b>概要:</b> {summary}</div>
            <div className="row"><b>詳細:</b> {detail}</div>
            <div className="row"><b>最大人数:</b> {max_participants}</div>
            <div className="row"><b>締切日:</b> {deadline}</div>
            {image && <div className="row"><b>画像:</b> {typeof image === "string" ? image : image.name}</div>}
            {error && <div style={{ color: "red" }}>{error}</div>}
            <button onClick={handleConfirm} disabled={loading} style={{ background: "#1976d2", color: "#fff", marginTop: 16 }}>
                {loading ? "登録中..." : buttonText}
            </button>
            <button
                type="button"
                style={{ marginLeft: 8 }}
                onClick={() => {
                    // 入力内容をlocalStorageに保存
                    const saveData = {
                        title, date, location, category, keywords, summary, detail, deadline, image, max_participants
                    };
                    localStorage.setItem("eventCreateDraft", JSON.stringify(saveData));
                    router.back();
                }}
            >戻る</button>
        </div>
    );
}
