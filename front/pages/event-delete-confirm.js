import { useRouter } from "next/router";
import { useState, useEffect } from "react";

export default function EventDeleteConfirm() {
    const router = useRouter();
    const [eventId, setEventId] = useState("");
    const [eventData, setEventData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!router.isReady) return;
        const { id } = router.query;
        setEventId(id);
        if (id) {
            // イベント詳細取得
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:7071";
            const isLocal = API_BASE_URL.includes("localhost") || API_BASE_URL.includes("127.0.0.1");
            const API_EVENTS_PATH = isLocal ? "/api/events" : "/events";
            fetch(`${API_BASE_URL}${API_EVENTS_PATH}/${id}`)
                .then(res => res.json())
                .then(data => setEventData(data))
                .catch(() => setEventData(null));
        }
    }, [router.isReady, router.query]);

    const handleDelete = async () => {
        setLoading(true);
        setError("");
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:7071";
        const isLocal = API_BASE_URL.includes("localhost") || API_BASE_URL.includes("127.0.0.1");
        const API_EVENTS_PATH = isLocal ? "/api/events" : "/events";
        try {
            const res = await fetch(`${API_BASE_URL}${API_EVENTS_PATH}/${eventId}`, {
                method: "DELETE"
            });
            if (res.ok) {
                router.push("/event-delete-done");
            } else {
                let err;
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    err = await res.json();
                } else {
                    err = { error: await res.text() };
                }
                setError("削除失敗: " + (err.error || res.status));
            }
        } catch (err) {
            setError("通信エラー: " + err);
        }
        setLoading(false);
    };

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
            <button onClick={handleDelete} disabled={loading} style={{ background: "#d32f2f", color: "#fff", marginTop: 16 }}>
                {loading ? "削除中..." : "この内容で削除"}
            </button>
            <button
                type="button"
                style={{ marginLeft: 8 }}
                onClick={() => router.back()}
            >戻る</button>
        </div>
    );
}
