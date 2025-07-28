import React from "react";

type Participant = {
  id: number;
  l_name?: string;
  f_name?: string;
};

type Props = {
  participants: Participant[];
  loading: boolean;
};

const listContainerStyle: React.CSSProperties = {
  background: "#fafaff",
  borderRadius: 8,
  boxShadow: "0 2px 8px #0001",
  padding: "1.2em",
  marginTop: "2em",
  maxWidth: 400,
};

const headingStyle: React.CSSProperties = {
  color: "#1976d2",
  fontWeight: 700,
  fontSize: "1.2em",
  marginBottom: "1em",
};

const emptyStyle: React.CSSProperties = {
  color: "#888",
  textAlign: "center",
  margin: "1em 0",
};

const listStyle: React.CSSProperties = {
  listStyle: "none",
  padding: 0,
  margin: 0,
};

const itemStyle: React.CSSProperties = {
  padding: "0.5em 0",
  borderBottom: "1px solid #e0e0e0",
  fontSize: "1em",
};

export default function ParticipantsList({ participants, loading }: Props) {
  return (
    <div style={listContainerStyle}>
      <h2 style={headingStyle}>参加者一覧</h2>
      {loading ? (
        <div style={emptyStyle}>参加者を取得中...</div>
      ) : participants.length === 0 ? (
        <div style={emptyStyle}>参加者はいません。</div>
      ) : (
        <ul style={listStyle}>
          {participants.map((user) => (
            <li key={user.id} style={itemStyle}>
              <span style={{ color: "#1976d2", fontWeight: 500 }}>{user.l_name ?? ""} {user.f_name ?? ""}</span>
              <span style={{ color: "#aaa", marginLeft: 8, fontSize: "0.9em" }}>ID: {user.id}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}