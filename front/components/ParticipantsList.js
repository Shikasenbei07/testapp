import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const API_URL_GET_PARTICIPANTS = "http://localhost:7071/api/get_participants";

const ParticipantsList = () => {
    const router = useRouter();
    const eventId = router.query.event_id || router.query.eventId;
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!eventId) return;
        setLoading(true);
        fetch(`${API_URL_GET_PARTICIPANTS}?event_id=${eventId}`)
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
                <div style={{ display: "flex", alignItems: "center" }}>
                    {participants.map(p => (
                        <a
                        key={p.id}
                        href={`/user/${p.id}`}
                        title={p.handle_name}
                        style={{
                            display: "inline-block",
                            marginLeft: "0.5rem",
                        }}
                        >
                        <img
                            src={p.profile_img}
                            alt={p.handle_name}
                            style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            objectFit: "cover",
                            cursor: "pointer",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            zIndex: 1100,
                            }}
                        />
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ParticipantsList;
