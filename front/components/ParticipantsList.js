import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const API_URL_GET_PARTICIPANTS = process.env.NEXT_PUBLIC_API_URL_GET_PARTICIPANTS;

const ParticipantsList = () => {
    const router = useRouter();
    const eventId = router.query.event_id || router.query.eventId;
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!eventId) return;
        setLoading(true);
        fetch(`${API_URL_GET_PARTICIPANTS}&event_id=${eventId}`)
            .then(res => {
                if (!res.ok) throw new Error('Network response was not ok');
                return res.json();
            })
            .then(data => {
                setParticipants(Array.isArray(data) ? data : []);
            })
            .catch(() => setParticipants([]))
            .finally(() => setLoading(false));
    }, [eventId]);

    return (
        <div>
            <h3>参加者一覧</h3>
            {loading ? (
                <div>参加者を取得中...</div>
            ) : participants.length === 0 ? (
                <div>参加者はいません。</div>
            ) : (
                <ul>
                    {participants.map(p => (
                        <li key={p.id}>
                            {p.handle_name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ParticipantsList;
