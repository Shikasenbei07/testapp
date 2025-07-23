import { useState } from "react";
import { useRouter } from "next/router";
import QandA from "../components/QandA"; // パスはプロジェクト構成に合わせて調整

const API_URL_LOGIN = "https://0x0-login.azurewebsites.net/api/login?code=9L4lUJuBIQvolKJrqK4EUFKUpvZFevZKRN8DLkhkr-5qAzFucYp7_Q%3D%3D";
const validity_time = 60 * 60 * 1000; // ログインの有効時間（ミリ秒）

export default function Login() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setPassword("");
    setError("");
    try {
      const res = await fetch(
        API_URL_LOGIN,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ "id": id, "password": password }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        const expire = Date.now() + validity_time;
        localStorage.setItem("id", data.id);
        localStorage.setItem("id_expire", expire);
        router.push("/event");
      } else {
        setError("ユーザー名またはパスワードが正しくありません");
      }
    } catch (err) {
      setError("通信エラーが発生しました");
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(90deg, #e0e7ff 0%, #fff 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          borderRadius: "16px",
          boxShadow: "0 4px 24px #7f5af040",
          padding: "2.5em 2em",
          minWidth: "320px",
          width: "100%",
          maxWidth: "400px",
          display: "flex",
          flexDirection: "column",
          gap: "1.5em"
        }}
      >
        <h2 style={{ textAlign: "center", color: "#7f5af0", marginBottom: "1em" }}>ログイン</h2>
        <div>
          <label style={{ fontWeight: "bold", color: "#333", marginBottom: "0.5em", display: "block" }}>ユーザー名</label>
          <input
            value={id}
            onChange={e => setId(e.target.value)}
            style={{
              width: "100%",
              padding: "0.7em",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "1em"
            }}
            placeholder="ユーザー名を入力"
            autoFocus
          />
        </div>
        <div>
          <label style={{ fontWeight: "bold", color: "#333", marginBottom: "0.5em", display: "block" }}>パスワード</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "0.7em",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "1em"
            }}
            placeholder="パスワードを入力"
          />
        </div>
        <button
          type="submit"
          style={{
            background: "#7f5af0",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            padding: "0.8em",
            fontWeight: "bold",
            fontSize: "1.1em",
            cursor: "pointer",
            marginTop: "0.5em"
          }}
        >
          ログイン
        </button>
        {error && <div style={{ color: "#f43f5e", textAlign: "center", marginTop: "0.5em" }}>{error}</div>}
      </form>
      <QandA characterImg="/images/character.png" />
    </div>
  );
}