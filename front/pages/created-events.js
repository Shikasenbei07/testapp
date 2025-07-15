import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import EventList from "../components/EventList";

export default function CreatedEventsContainer() {
    const [events, setEvents] = useState([]);
    const router = useRouter();
    const userId = "0738";

    useEffect(() => {
        if (!userId) return;
        //いったんURLも固定
        fetch(`https://0x0-my-created-events-bpc3aghwg9bsb6fh.japaneast-01.azurewebsites.net/api/my_created_events?user_id=${userId}`)
            .then((res) => res.json())
            .then(setEvents);
    }, [userId]);

    const handleEdit = (eventId) => {
        router.push(`/event_edit/${eventId}`);
    };

    return <EventList events={events} onEdit={handleEdit} title="作成済みイベント一覧" />;
}
