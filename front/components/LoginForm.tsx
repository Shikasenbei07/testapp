import React, { useState } from "react";
import type { LoginParams } from "../types/Login";

type Props = {
  loading: boolean;
  error: string | null;
  submitLogin: (params: LoginParams) => void;
};

export default function LoginForm({ loading, error, submitLogin }: Props) {
  const [form, setForm] = useState({ id: "", password: "" } as LoginParams);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitLogin(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>ユーザー名</label>
        <input
          name="id"
          value={form.id}
          onChange={handleChange}
          autoComplete="username"
        />
      </div>
      <div>
        <label>パスワード</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          autoComplete="current-password"
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? "送信中..." : "ログイン"}
      </button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
}