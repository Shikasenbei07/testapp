import { useState } from "react";
import { useRouter } from "next/router";

export default function Login() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("https://0x0-login.azurewebsites.net/api/login?code=9L4lUJuBIQvolKJrqK4EUFKUpvZFevZKRN8DLkhkr-5qAzFucYp7_Q%3D%3D", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password }),
      });
      // 保存時（例：1時間後に期限切れ）
      if (res.ok) {
        const data = await res.json();
        const expire = Date.now() + 60 * 60 * 1000; // 1時間（ミリ秒）
        localStorage.setItem("id", data.id);
        localStorage.setItem("id_expire", expire);
        router.push("/mypage");
      } else {
        setError("ログイン失敗");
      }
    } catch (err) {
      setError("通信エラー");
    }
  }

  function handleIdChange(e) {
    setId(e.target.value);
  }

  function handlePasswordChange(e) {
    setPassword(e.target.value);
  }

  // 取得時（例：マイページなどで利用する場合）
  function getValidId() {
    const id = localStorage.getItem("id");
    const expire = localStorage.getItem("id_expire");
    if (!id || !expire || Date.now() > Number(expire)) {
      localStorage.removeItem("id");
      localStorage.removeItem("id_expire");
      return null;
    }
    return id;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>ユーザー名</label>
        <input value={id} onChange={handleIdChange} />
      </div>
      <div>
        <label>パスワード</label>
        <input type="password" value={password} onChange={handlePasswordChange} />
      </div>
      <button type="submit">ログイン</button>
      {error && <div style={{color:"red"}}>{error}</div>}
    </form>
  );
}