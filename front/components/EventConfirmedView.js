export default function EventConfirmedView({ message, onBack }) {
  return (
    <div>
      <h1>{message}</h1>
      <button onClick={onBack}>イベント一覧へ戻る</button>
    </div>
  );
}