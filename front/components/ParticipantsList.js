import React, { useEffect, useState } from 'react';

const ParticipantsList = ({ eventId }) => {
    const [participants, setParticipants] = useState([]);

    useEffect(() => {
        fetch(`https://0x0-participants-list-a3ccaze5fhfxhzc5.japaneast-01.azurewebsites.net/api/participants-list?code=f_9tpb31_ZJiYApv4xACeaoyHHutK_czVWEGsuZv_7IpAzFu69yp_w%3D%3D&event_id=${eventId}`)
            .then(res => res.text())
            .then(data => setParticipants(data.participants || []));
    }, [eventId]);

    return (
        <div>
            <h3>参加者一覧</h3>
            <ul>
                {participants.map(p => (
                    <li key={p.id}>
                        {p.l_name} {p.f_name} ({p.email})
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ParticipantsList;
