import { useState } from "react";
import { useRouter } from "next/router";

const API_URL_LOGIN = "https://0x0-login.azurewebsites.net/api/login?code=9L4lUJuBIQvolKJrqK4EUFKUpvZFevZKRN8DLkhkr-5qAzFucYp7_Q%3D%3D";

export default function Login() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const validity_time = 60 * 60 * 1000; // ログインの有効時間（ミリ秒） 

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
        setError("ログイン失敗");
      }
    } catch (err) {
      setError("通信エラー");
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #e0e7ef 0%, #c7d2fe 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Share Tech Mono', 'Fira Mono', 'Consolas', monospace"
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#f8fafc",
          border: "2px solid #b4b4d8",
          borderRadius: "16px",
          boxShadow: "0 0 18px #b4b4d830, 0 0 6px #c7d2fe30",
          padding: "2.5em 2em",
          minWidth: "340px",
          display: "flex",
          flexDirection: "column",
          gap: "1.2em",
          position: "relative"
        }}
      >
        <div style={{
          textAlign: "center",
          color: "#23263a",
          fontWeight: "bold",
          fontSize: "1.2em",
          letterSpacing: "0.08em",
          marginBottom: "1em"
        }}>
          社内イベント管理システム
        </div>
        <div>
          <label style={{
            color: "#5a5af0",
            fontWeight: "bold",
            marginBottom: "0.3em",
            display: "block",
            letterSpacing: "0.05em"
          }}>USER ID</label>
          <input
            value={id}
            onChange={e => setId(e.target.value)}
            style={{
              width: "100%",
              minWidth: "320px",
              maxWidth: "480px",
              padding: "0.8em",
              borderRadius: "8px",
              border: "1.5px solid #b4b4d8",
              background: "#f1f5fa",
              color: "#23263a",
              fontSize: "1.1em",
              outline: "none",
              boxShadow: "0 0 8px #b4b4d820 inset"
            }}
            autoFocus
            autoComplete="username"
          />
        </div>
        <div>
          <label style={{
            color: "#5a5af0",
            fontWeight: "bold",
            marginBottom: "0.3em",
            display: "block",
            letterSpacing: "0.05em"
          }}>PASSWORD</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{
              width: "100%",
              minWidth: "320px",
              maxWidth: "480px",
              padding: "0.8em",
              borderRadius: "8px",
              border: "1.5px solid #b4b4d8",
              background: "#f1f5fa",
              color: "#23263a",
              fontSize: "1.1em",
              outline: "none",
              boxShadow: "0 0 8px #b4b4d820 inset"
            }}
            autoComplete="current-password"
          />
        </div>
        <button
          type="submit"
          style={{
            background: "linear-gradient(90deg, #5a5af0 0%, #b4b4d8 100%)",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "0.9em 0",
            fontWeight: "bold",
            fontSize: "1.1em",
            cursor: "pointer",
            letterSpacing: "0.1em",
            boxShadow: "0 2px 12px #b4b4d820"
          }}
        >
          LOGIN
        </button>
        {error && (
          <div style={{
            color: "#f43f5e",
            background: "#fff",
            border: "1px solid #f43f5e",
            borderRadius: "6px",
            padding: "0.7em",
            textAlign: "center",
            fontWeight: "bold",
            marginTop: "0.5em",
            letterSpacing: "0.05em"
          }}>
            {error}
          </div>
        )}
      </form>
    </div>
  );
}