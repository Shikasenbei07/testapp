import { useState } from "react";
import { updateUser } from "../../lib/userManagementAPI";
import type { User } from "../../types/UserManagement";

export const useUpdateUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleUpdateUser = async (id: string, userData: Partial<User>) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const result = await updateUser(id, userData);
      setSuccessMessage(result.message);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "更新に失敗しました";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return {
    handleUpdateUser,
    loading,
    error,
    successMessage,
  };
};
