import { useParticipants } from "../../hooks/participation/useParticipants";

export default function ParticipantsList({ eventId }) {
  const { participants, loading, error } = useParticipants(eventId);

  if (loading) return <p>読み込み中...</p>;
  if (!participants || participants.length === 0) return <p style={{ textAlign: "center" }}>参加者がいません</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
        {participants.map(p => (
            <a
                key={p.id}
                href={`/user/${p.id}`}
                title={p.handleName}
                style={{
                    display: "inline-block",
                    marginLeft: "0.5rem",
                }}
            >
                <img
                    src={p.profileImg}
                    alt={p.handleName}
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
  );
}
