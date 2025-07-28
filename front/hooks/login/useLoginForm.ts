import { useState } from "react";
import type { LoginParams } from "../../types/Login";
import { login } from "../../lib/loginAPI";

const validity_time = 60 * 60 * 1000; // ログインの有効時間（ミリ秒）

export const useLoginForm = () => {
  const [formData, setFormData] = useState({
    id: "",
    password: "",
  } as LoginParams);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 入力値の変更を反映
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev => ({
      ...prev,
      [name]: value
    })));
  };

  // ログインボタンクリック時の動作
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await login({
        id: formData.id,
        password: formData.password,
      });
      localStorage.setItem("id", result.id)
      const expire = Date.now() + validity_time;
      localStorage.setItem("id_expire", expire.toString());
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : '不明なエラー';
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    handleChange,
    handleSubmit,
    loading,
    error,
  };
};