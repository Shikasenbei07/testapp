import { useState, useEffect } from "react";
import { useRouter } from "next/router";

const API_URL_LOGIN = "https://0x0-login.azurewebsites.net/api/login?code=9L4lUJuBIQvolKJrqK4EUFKUpvZFevZKRN8DLkhkr-5qAzFucYp7_Q%3D%3D";
const validity_time = 60 * 60 * 1000;

export default function Login() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // localStorage操作を安全に行う関数
  const setLoginData = (userId, expire) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("id", userId);
      localStorage.setItem("id_expire", expire);
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setPassword("");
    setError("");
    try {
      const res = await fetch(API_URL_LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "id": id, "password": password }),
      });
      
      if (res.ok) {
        const data = await res.json();
        const expire = Date.now() + validity_time;
        setLoginData(data.id, expire); // 安全にlocalStorageに保存
        router.push("/event");
      } else {
        setError("ユーザー名またはパスワードが正しくありません");
      }
    } catch (err) {
      setError("通信エラーが発生しました");
    }
  }

  return (
    <div>
      <h1>ログイン</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="id">ユーザーID:</label>
          <input
            type="text"
            id="id"
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">パスワード:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">ログイン</button>
      </form>
    </div>
  );
}

// getServerSidePropsを削除（静的生成を許可）