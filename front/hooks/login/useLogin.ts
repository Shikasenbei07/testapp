import { useState } from "react";
import type { LoginParams } from "../../types/Login";
import { login } from "../../lib/loginAPI";

export const useLogin = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validity_time = 60 * 60 * 1000;
  
  const submitLogin = async (params: LoginParams) => {
    setLoading(true);
    setError(null);

    try {
      const res = await login(params);
      setUserId(res.id);
      if (res && typeof window !== "undefined") {
        localStorage.setItem("id", res.id);
        const expire = Date.now() + validity_time;
        localStorage.setItem("id_expire", expire.toString());
      }
    } catch (err: any) {
      setError(err.message || "ログインに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    userId,
    submitLogin,
  };
};