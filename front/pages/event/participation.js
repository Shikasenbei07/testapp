import { useRouter } from 'next/router';
import { useEventParticipation } from '../../hooks/useEventParticipation';
import EventParticipationView from '../../components/EventParticipationView';

export default function EventParticipation() {
  const router = useRouter();
  const { event_id } = router.query;
  const {
    event,
    loading,
    error,
    joining,
    handleJoin,
  } = useEventParticipation(event_id);

  return (
    <EventParticipationView
      event={event}
      loading={loading}
      error={error}
      joining={joining}
      onJoin={handleJoin}
      onBack={() => router.back()}
    />
  );
}