export default function ReservationListAlert({ show, msg }) {
  if (!show) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: "40px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "linear-gradient(90deg, #7f5af0 0%, #2cb67d 100%)",
        color: "#fff",
        padding: "1em 2em",
        borderRadius: "12px",
        boxShadow: "0 4px 24px #2cb67d40",
        fontWeight: "bold",
        fontSize: "1.1em",
        zIndex: 9999,
        letterSpacing: "0.05em"
      }}
    >
      {msg}
    </div>
  );
}