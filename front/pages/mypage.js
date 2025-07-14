import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function MyPage() {
  const [lName, setLName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") {
      setError("クライアントでのみ利用可能です");
      setLoading(false);
      return;
    }

    const id = localStorage.getItem("id");
    if (!id) {
      router.push("/");
      return;
    }

    fetch("https://0x0-login.azurewebsites.net/api/mypage?code=EzjjwAEIjnxywfEksi9uz-ixU-8Qet_ZjJCegzf8abomAzFu6xZbzw%3D%3D", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
      .then(res => {
        if (!res.ok) throw new Error("取得失敗");
        return res.json();
      })
      .then(data => {
        setLName(data.l_name ?? "");
        setLoading(false);
      })
      .catch(() => {
        setError("データ取得エラー");
        setLoading(false);
      });
  }, [router]);

  // ログアウト処理
  function handleLogout() {
    localStorage.removeItem("id");
    localStorage.removeItem("id_expire");
    router.push("/");
  }

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div style={{color:"red"}}>{error}</div>;

  return (
    <div>
      {lName}さんのページ
      <br />
      <button onClick={handleLogout}>ログアウト</button>
    </div>
  );
}