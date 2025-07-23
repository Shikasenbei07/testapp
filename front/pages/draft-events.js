import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getValidId } from "../utils/getValidId";
import EventList from "../components/EventList";

const API_URL_GET_DRAFT = process.env.NEXT_PUBLIC_API_URL_GET_DRAFT;

export default function DraftEventsContainer() {
    const [events, setEvents] = useState([]);
    const router = useRouter();
    const userId = getValidId();

    useEffect(() => {
        fetch(API_URL_GET_DRAFT + `?id=${userId}`, {
            method: "GET"})
            .then((res) => res.json())
            .then(setEvents);
    }, [userId]);

    const handleEdit = (eventId) => {
        router.push(`/event_edit/${eventId}`);
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                width: "100vw",
                background: "linear-gradient(120deg, #e0e7ef 0%, #c7d2fe 60%, #a5b4fc 100%)",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                fontFamily: "'Montserrat', 'Noto Sans JP', 'Helvetica Neue', Arial, 'メイリオ', sans-serif",
                overflowX: "hidden",
                paddingTop: 40
            }}
        >
            <div
                style={{
                    background: "#fff",
                    borderRadius: 18,
                    boxShadow: "0 8px 32px #b4b4d880, 0 2px 8px #c7d2fe80",
                    padding: 44,
                    color: "#23263a",
                    fontFamily: "'Montserrat', 'Noto Sans JP', 'Helvetica Neue', Arial, 'メイリオ', sans-serif",
                    border: "2px solid #e0e7ef",
                    maxWidth: 900,
                    width: "100%",
                    margin: "40px auto",
                    overflow: "auto"
                }}
            >
                <EventList events={events} onEdit={handleEdit} title="下書きイベント一覧" />
            </div>
        </div>
    );
}