import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { getValidId } from "../../utils/getValidId";

const API_URL_GET_EVENT_DETAIL = process.env.NEXT_PUBLIC_API_URL_GET_EVENT_DETAIL;
const API_URL_PARTICIPATE = process.env.NEXT_PUBLIC_API_URL_PARTICIPATE;

export default function EventConfirm() {
  const router = useRouter()
  const { event_id } = router.query
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [joining, setJoining] = useState(false)
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!event_id) return
    setLoading(true)
    fetch(API_URL_GET_EVENT_DETAIL + `&event_id=${event_id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error)
        else setEvent(data)
        setLoading(false)
      })
      .catch(() => {
        setError('データ取得エラー')
        setLoading(false)
      })
  }, [event_id])

  const handleJoin = async () => {
    setJoining(true)
    const userId = getValidId();
    const res = await fetch(API_URL_PARTICIPATE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        event_id: event_id, // イベントID
        id: userId         // ユーザーID
      })
    })
    let data = {}
    try {
      // レスポンスが空の場合はエラーを投げる
      const text = await res.text()
      if (!text) throw new Error("空のレスポンス")
      data = JSON.parse(text)
    } catch (e) {
      setJoining(false)
      router.push(`/event/confirmed?event_id=${event_id}&status=fail`)
      return
    }
    if (res.ok && data.result === "ok") {
      router.push(`/event/confirmed?event_id=${event_id}&status=success`)
    } else {
      router.push(`/event/confirmed?event_id=${event_id}&status=fail`)
    }
    setJoining(false)
  }

  if (loading) return <div>読み込み中...</div>
  if (error) return <div>エラー: {error}</div>
  if (!event) return null

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
          minWidth: "340px",
          maxWidth: "440px",
          width: "100%",
          textAlign: "center"
        }}
      >
        <h1
          style={{
            color: "#5a5af0",
            fontWeight: 900,
            fontSize: "2em",
            letterSpacing: "0.12em",
            marginBottom: "1.5rem",
            textShadow: "0 4px 16px #b4b4d850, 0 1px 0 #fff",
            fontFamily: "'Bebas Neue', 'Montserrat', 'Share Tech Mono', 'Fira Mono', 'Consolas', monospace",
            textTransform: "uppercase"
          }}
        >
          イベント参加確認
        </h1>
        <p style={{
          fontSize: "1.15em",
          color: "#23263a",
          marginBottom: "2em",
          fontWeight: "bold"
        }}>
          「{event.event_title}」に参加しますか？
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "1.2em" }}>
          <button
            onClick={handleJoin}
            disabled={joining || !event_id}
            style={{
              background: "linear-gradient(90deg, #5a5af0 0%, #b4b4d8 100%)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "0.7em 2em",
              fontWeight: "bold",
              fontSize: "1.1em",
              cursor: joining || !event_id ? "not-allowed" : "pointer",
              letterSpacing: "0.08em",
              boxShadow: "0 2px 12px #b4b4d820",
              opacity: joining || !event_id ? 0.6 : 1,
              transition: "opacity 0.2s"
            }}
          >
            確定
          </button>
          <button
            onClick={() => router.back()}
            style={{
              background: "#e0e7ef",
              color: "#23263a",
              padding: "0.7em 2em",
              border: "1.5px solid #b4b4d8",
              borderRadius: "8px",
              fontWeight: "bold",
              fontSize: "1.1em",
              cursor: "pointer",
              boxShadow: "0 2px 8px #b4b4d820"
            }}
          >
            戻る
          </button>
        </div>
      </div>
    </div>
  )
}