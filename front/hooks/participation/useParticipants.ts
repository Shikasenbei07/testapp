import { useState, useEffect } from "react";
import { getParticipants } from "../../lib/participationAPI";
import type { ParticipationInfo } from "../../types/Participation";

export const useParticipants = (eventId: number) => {
  const [participants, setParticipants] = useState<ParticipationInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;

    const fetchParticipants = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getParticipants(eventId);
        setParticipants(data);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "取得に失敗しました";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [eventId]);

  return {
    participants,
    loading,
    error,
  };
};
