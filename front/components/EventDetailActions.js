export default function EventDetailActions({ event_id, router }) {
  return (
    <div>
      <button onClick={() => router.push(`/event`)}>戻る</button>
      <button
        style={{
          marginLeft: '1rem',
          background: '#1976d2',
          color: 'white',
          padding: '0.5rem 1.5rem',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
        onClick={() => router.push(`/event/participation?event_id=${event_id}`)}
      >
        参加
      </button>
      <button
        style={{
          marginLeft: '1rem',
          background: '#43a047',
          color: 'white',
          padding: '0.5rem 1.5rem',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
        onClick={() => router.push(`/inquiry/new?event_id=${event_id}`)}
      >
        問い合わせる
      </button>
    </div>
  );
}