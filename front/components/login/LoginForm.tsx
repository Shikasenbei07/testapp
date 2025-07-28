export default function LoginForm({
  onSubmit,
  formData,
  handleChange,
  loading,
  error,
}) {
  return (
    <form onSubmit={onSubmit}>
      <div>
        <label>ユーザー名</label>
        <input
          type="text"
          name="id"
          value={formData.id}
          onChange={handleChange}
          autoComplete="username"
          placeholder="ユーザーidを入力"
          required
        />
      </div>
      <div>
        <label>パスワード</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="パスワードを入力"
          required
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'ログイン中...' : 'ログイン'}
      </button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
}