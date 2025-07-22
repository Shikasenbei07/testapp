import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getValidId } from "../../utils/getValidId";

const API_URL_GET_USER = process.env.NEXT_PUBLIC_API_URL_GET_USER;

export default function MyPage() {
  const [lName, setLName] = useState("");
  const [profileImg, setProfileImg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") {
      setError("クライアントでのみ利用可能です");
      setLoading(false);
      return;
    }

    const id = getValidId();
    if (!id) {
      router.push("/login");
      return;
    }

    fetch(API_URL_GET_USER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: id }), // ← バックエンドは"id"で受け取る
    })
      .then(async res => {
        if (!res.ok) {
          // サーバーからのエラー詳細を取得してthrow
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "取得失敗");
        }
        return res.json();
      })
      .then(data => {
        setLName(data.l_name ?? "");
        setProfileImg(data.profile_img ?? null);
        setLoading(false);
      })
      .catch((e) => {
        setError("データ取得エラー: " + e.message);
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
    <div style={{ maxWidth: 400, margin: "40px auto", padding: "2rem", background: "#f7faff", borderRadius: "16px", boxShadow: "0 2px 12px #1976d230", textAlign: "center" }}>
      {profileImg && (
        <div style={{ marginBottom: 16 }}>
          <img
            src={profileImg}
            alt="プロフィール画像"
            style={{ width: 120, height: 120, objectFit: "cover", borderRadius: "50%" }}
          />
        </div>
      )}
      <div style={{ fontWeight: "bold", fontSize: "1.2rem", marginBottom: "1.2rem" }}>
        {lName}さんのページ
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
        <button
          style={{ padding: "10px 0", background: "#1976d2", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700, fontSize: "1rem", cursor: "pointer" }}
          onClick={() => router.push("/mypage/favorites")}
        >
          お気に入りイベント一覧
        </button>
        <button
          style={{ padding: "10px 0", background: "#00c2a0", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700, fontSize: "1rem", cursor: "pointer" }}
          onClick={() => router.push("/mypage/history")}
        >
          予約履歴
        </button>
        <button
          style={{ padding: "10px 0", background: "#7f5af0", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700, fontSize: "1rem", cursor: "pointer" }}
          onClick={() => router.push("/mypage/reservation")}
        >
          参加予約一覧
        </button>
      </div>
      <button onClick={handleLogout} style={{ marginRight: 12, padding: "8px 16px", background: "#ff6666", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700 }}>
        ログアウト
      </button>
      <button
        style={{ padding: "8px 16px", background: "#e0e0e0", color: "#333", border: "none", borderRadius: 6, fontWeight: 700 }}
        onClick={() => router.push("/mypage/setting")}
      >
        設定へ
      </button>
    </div>
  );
}