import { useState } from 'react';
import { login } from '../lib/loginAPI';

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* @param {string} id - ユーザーID
   * @param {string} password - ユーザーパスワード
   * @returns {Promise<{ id: string }|null>} - ログイン成功時はAPIレスポンスのオブジェクト、失敗時はnullを返す
   */
  const handleLogin = async (id, password) => {
    setLoading(true);
    setError(null);
    try {
      const result = await login(id, password);
      return result; // {id}
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { handleLogin, loading, error };
};
