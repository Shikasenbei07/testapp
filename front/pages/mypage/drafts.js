import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getValidId } from "../../utils/getValidId";
import EventList from "../../components/EventList";

const API_URL_GET_DRAFT = process.env.NEXT_PUBLIC_API_URL_GET_DRAFT;

export default function DraftEventsContainer() {
    const [events, setEvents] = useState([]);
    const router = useRouter();
    const userId = getValidId();

    useEffect(() => {
        if (!userId) return; // バグ修正: userIdがnullの場合はfetchしない
        fetch(API_URL_GET_DRAFT + `&user_id=${encodeURIComponent(userId)}`, {
            method: "GET",
        })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch drafts");
                return res.json();
            })
            .then(setEvents)
            .catch(() => setEvents([]));
    }, [userId]);

    const handleEdit = (eventId) => {
        router.push(`/event/edit?event_id=${eventId}`); // バグ修正: 正しいパスに修正
    };

    return <EventList events={events} onEdit={handleEdit} title="下書きイベント一覧" />;
}