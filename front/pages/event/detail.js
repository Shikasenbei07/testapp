import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export default function EventDetail() {
  const router = useRouter()
  const { event_id } = router.query
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    if (!event_id) return
    setLoading(true)
    fetch(`http://localhost:7071/api/event/detail?event_id=${event_id}`)
      .then(res => {
        console.log('API status:', res.status)
        return res.json()
      })
      .then(data => {
        console.log('API response:', data)
        if (data.error) setError(data.error)
        else setEvent(data)
        setLoading(false)
      })
      .catch((e) => {
        setError('データ取得エラー')
        setLoading(false)
        console.error(e)
      })
  }, [event_id])

  const handleJoin = async () => {
    setJoining(true)
    const userId = "sample_user"
    const res = await fetch('http://localhost:7071/api/event/participate', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_id, id: userId })
    })
    let data = {}
    try {
      data = await res.json()
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

  const handleGoToConfirm = () => {
    router.push(`/event/confirm?event_id=${event_id}`)
  }

  return (
    <div>
      <h1>{event.event_title}</h1>
      <img src={event.image} alt={event.event_title} style={{maxWidth: 400}} />
      <p>カテゴリ: {event.event_category}</p>
      <p>日時: {event.event_datetime}</p>
      <p>締切: {event.deadline}</p>
      <p>場所: {event.location}</p>
      <p>最大人数: {event.max_participants}</p>
      <p>現在人数: {event.current_participants}</p>
      <p>作成者: {event.creator}</p>
      <p>概要: {event.description}</p>
      <p>内容: {event.content}</p>
      <button onClick={handleGoToConfirm}>
        参加する
      </button>
    </div>
  )
}