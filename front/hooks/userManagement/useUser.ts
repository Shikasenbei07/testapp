import { useState, useEffect } from "react";
import { getUser } from "../../lib/userManagementAPI";
import type { User } from "../../types/UserManagement";

export const useUser = (id: string | null) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedUser = await getUser(id);
        setUser(fetchedUser);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "取得に失敗しました";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  return {
    user,
    loading,
    error,
  };
};