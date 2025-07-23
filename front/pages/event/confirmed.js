import { useRouter } from 'next/router'

export default function EventConfirmed() {
  const router = useRouter()
  const { event_id, status } = router.query

  let message = ""
  if (status === "success") {
    message = "参加申し込み確定しました"
  } else if (status === "fail") {
    message = "予定人数に達しました。\nまたの参加をお待ちしております。"
  }

  const handleBackToDetail = () => {
    router.push(`/event`)
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(120deg, #e0e7ef 0%, #c7d2fe 60%, #a5b4fc 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Montserrat', 'Share Tech Mono', 'Fira Mono', 'Consolas', monospace"
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "20px",
          boxShadow: "0 8px 32px 0 #b4b4d880, 0 2px 8px #c7d2fe80",
          padding: "2.5em 2em",
          minWidth: "320px",
          maxWidth: "420px",
          width: "100%",
          textAlign: "center"
        }}
      >
        <h1
          style={{
            color: status === "success" ? "#2cb67d" : "#f43f5e",
            fontWeight: 900,
            fontSize: "2em",
            letterSpacing: "0.12em",
            marginBottom: "2em",
            textShadow: "0 4px 16px #b4b4d850, 0 1px 0 #fff",
            fontFamily: "'Bebas Neue', 'Montserrat', 'Share Tech Mono', 'Fira Mono', 'Consolas', monospace",
            textTransform: "uppercase",
            whiteSpace: "pre-line" // ← 追加
          }}
        >
          {message}
        </h1>
        <button
          onClick={handleBackToDetail}
          style={{
            background: "linear-gradient(90deg, #5a5af0 0%, #b4b4d8 100%)",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "0.8em 2em",
            fontWeight: "bold",
            fontSize: "1.1em",
            cursor: "pointer",
            letterSpacing: "0.08em",
            boxShadow: "0 2px 12px #b4b4d820",
            marginTop: "1em"
          }}
        >
          イベント一覧へ戻る
        </button>
      </div>
    </div>
  )
}