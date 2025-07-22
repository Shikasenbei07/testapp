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
  console.log("Profile Image:", profileImg);

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "linear-gradient(120deg, #e0e7ef 0%, #c7d2fe 60%, #a5b4fc 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Montserrat', 'Noto Sans JP', 'Helvetica Neue', Arial, 'メイリオ', sans-serif"
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 8px 32px 0 #b4b4d880, 0 2px 8px #c7d2fe80",
          padding: "2.5em 2em",
          minWidth: "340px",
          maxWidth: "420px",
          width: "100%",
          textAlign: "center"
        }}
      >
        {profileImg && (
          <div style={{ marginBottom: 16 }}>
            <img
              src={profileImg}
              alt="プロフィール画像"
              style={{ width: 120, height: 120, objectFit: "cover", borderRadius: "50%", boxShadow: "0 2px 12px #b4b4d820" }}
            />
          </div>
        )}
        <div style={{ fontWeight: 800, fontSize: "1.25em", marginBottom: "1em", color: "#5a5af0", letterSpacing: "0.06em" }}>
          {lName}さんのページ
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 24px",
            background: "linear-gradient(90deg, #f43f5e 0%, #b4b4d8 100%)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: "1em",
            marginBottom: 12,
            cursor: "pointer",
            boxShadow: "0 2px 8px #f43f5e40",
            letterSpacing: "0.05em",
            marginRight: 10
          }}
        >
          ログアウト
        </button>
        <button
          style={{
            padding: "8px 24px",
            background: "linear-gradient(90deg, #5a5af0 0%, #2cb67d 100%)", // 色を変更
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: "1em",
            cursor: "pointer",
            boxShadow: "0 2px 8px #2cb67d40",
            letterSpacing: "0.05em"
          }}
          onClick={() => router.push("/mypage/setting")}
        >
          設定へ
        </button>
      </div>
    </div>
  );
}