import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getValidId } from "../../utils/getValidId";
import EventList from "../../components/EventList";

const API_URL_GET_SELF_CREATED_EVENTS = process.env.NEXT_PUBLIC_API_URL_GET_SELF_CREATED_EVENTS;

export default function CreatedEventsContainer() {
    const [events, setEvents] = useState([]);
    const [error, setError] = useState("");
    const router = useRouter();
    const userId = getValidId();

    useEffect(() => {
        if (!userId) return;
        fetch(`${API_URL_GET_SELF_CREATED_EVENTS}&user_id=${userId}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`取得失敗: ${res.status}`);
                }
                return res.json();
            })
            .then(setEvents)
            .catch((err) => setError("イベント取得エラー: " + err.message));
    }, [userId]);

    const handleEdit = (eventId) => {
        router.push(`/event/edit?event_id=${eventId}`);
    };

    if (error) {
        return (
            <div
                style={{
                    color: "#5a5af0",
                    background: "#f8fafc",
                    border: "1.5px solid #b4b4d8",
                    borderRadius: "14px",
                    padding: "1.5em 2em",
                    margin: "2.5em auto",
                    maxWidth: 520,
                    fontWeight: 700,
                    textAlign: "center",
                    fontSize: "1.1em",
                    boxShadow: "0 4px 24px #b4b4d850, 0 2px 8px #c7d2fe80"
                }}
            >
                {error}
            </div>
        );
    }

    return (
        <div
            style={{
                maxWidth: 900,
                margin: "2.5em auto",
                background: "#fff",
                borderRadius: "22px",
                boxShadow: "0 8px 32px #b4b4d880, 0 2px 8px #c7d2fe80, 0 1.5px 0 #fff",
                padding: "2.5em 2em"
            }}
        >
            <EventList
                events={events}
                onEdit={handleEdit}
                title={
                    <span style={{
                        color: "#5a5af0",           // アクセントカラーで見やすく
                        fontWeight: 900,
                        fontSize: "1.4em",
                        letterSpacing: "0.08em",
                        textShadow: "0 2px 8px #b4b4d820"
                    }}>
                        作成済みイベント一覧
                    </span>
                }
            />
        </div>
    );
}
