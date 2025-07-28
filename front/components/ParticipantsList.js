import React, { useEffect, useState } from 'react';

const ParticipantsList = ({ eventId }) => {
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`https://0x0-participants-list-a3ccaze5fhfxhzc5.japaneast-01.azurewebsites.net/api/participants-list?code=f_9tpb31_ZJiYApv4xACeaoyHHutK_czVWEGsuZv_7IpAzFu69yp_w%3D%3D&event_id=${eventId}`)
            .then(res => res.text())
            .then(data => {
                setParticipants(data.participants || []);
                setLoading(false);
            });
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
                            {p.l_name} {p.f_name} ({p.email})
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ParticipantsList;
