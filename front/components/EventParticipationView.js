export default function EventParticipationView({
  event,
  loading,
  error,
  joining,
  onJoin,
  onBack
}) {
  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error}</div>;
  if (!event) return null;

  return (
    <div>
      <h1>イベント参加確認</h1>
      <p>「{event.event_title}」に参加しますか？</p>
      <button onClick={onJoin} disabled={joining}>確定</button>
      <button onClick={onBack}>戻る</button>
    </div>
  );
}