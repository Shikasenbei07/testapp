import React from "react";

export default function LoginForm({ form, handleChange, handleSubmit, loading, displayError }) {
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
      <button type="submit" disabled={loading}>ログイン</button>
      {displayError && (
        <div style={{ color: "red" }}>
          {typeof displayError === "string"
            ? displayError
            : displayError.message || String(displayError)}
        </div>
      )}
    </form>
  );
}