// 表示コンポーネント
import { useRouter } from "next/router";

export default function EventList({ events, onEdit, title }) {
    const router = useRouter();
    const handleCancel = (eventId) => {
        router.push(`/event/delete/confirm?event_id=${eventId}`);
    };
    return (
        <div>
            <h2>{title}</h2>
            <div className="event-list-container">
                {events.map((event) => (
                    <div key={event.event_id} className="event-list-item">
                        <div className="event-list-date">
                            {event.event_datetime ? event.event_datetime.slice(0, 10) : ""}
                        </div>
                        <div
                            className="event-list-title"
                            onClick={() => onEdit(event.event_id)}
                        >
                            {event.event_title}
                        </div>
                        <button
                            className="event-list-edit-btn"
                            onClick={() => onEdit(event.event_id)}
                        >
                            編集
                        </button>
                        <button
                            className="event-list-cancel-btn"
                            onClick={() => handleCancel(event.event_id)}
                        >
                            取り消し
                        </button>
                    </div>
                ))}
            </div>
            <style jsx>{`
                .event-list-container {
                    display: flex;
                    flex-direction: column;
                    gap: 1.2em;
                    align-items: center;
                }
                .event-list-item {
                    border: 1px solid #ccc;
                    border-radius: 8px;
                    padding: 1em;
                    background: #fafafa;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                    display: flex;
                    align-items: center;
                    gap: 1em;
                    max-width: 700px;
                    width: 100%;
                }
                .event-list-date {
                    color: #555;
                    min-width: 120px;
                    text-align: left;
                }
                .event-list-title {
                    flex: 1;
                    font-weight: bold;
                    font-size: 1.1em;
                    text-align: center;
                    cursor: pointer;
                    text-decoration: underline;
                    color: #5a5af0; /* アクセントカラーで見やすく */
                    text-shadow: 0 2px 8px #b4b4d820;
                }
                .event-list-edit-btn {
                    padding: 0.4em 1em;
                    border-radius: 4px;
                    border: none;
                    background: #1976d2;
                    color: #fff;
                    cursor: pointer;
                    margin-right: 0.5em;
                }
                .event-list-cancel-btn {
                    padding: 0.4em 1em;
                    border-radius: 4px;
                    border: none;
                    background: #d32f2f;
                    color: #fff;
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
}
