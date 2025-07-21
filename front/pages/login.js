import { useState } from "react";
import { useRouter } from "next/router";

const API_URL_LOGIN = process.env.NEXT_PUBLIC_API_URL_LOGIN;

export default function Login() {
  const [form, setForm] = useState({ id: "", password: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  const validity_time = 60 * 60 * 1000; 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(
        API_URL_LOGIN,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: form.id, password: form.password }),
        }
      );

      setForm((prev) => ({ ...prev, password: "" }));

      const data = await res.json();
      if (res.ok) {
        const expire = Date.now() + validity_time;
        localStorage.setItem("id", data.id);
        localStorage.setItem("id_expire", expire);
        router.push("/event");
      } else {
        setError("ログイン失敗: " + data.error);
      }
    } catch (err) {
      setError("通信エラー");
    }
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
      <button type="submit">ログイン</button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
}