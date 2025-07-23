import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function EventDraftConfirm() {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState(null);

  // クエリ取得
  const query = router.query;

  useEffect(() => {
    // 画像プレビュー用
    const img = localStorage.getItem("eventCreateImage");
    if (img) setImageUrl(img);
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleSave = () => {
    // 下書き保存API呼び出しなど
    // ...保存処理...
    router.push("/draft-events");
  };

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
          minWidth: "420px",           // 横幅を少し広く
          maxWidth: "720px",           // 横幅を少し広く
          width: "100%",
          textAlign: "center"
        }}
      >
        <h2
          style={{
            color: "#5a5af0",
            fontWeight: 900,
            fontSize: "1.5em",
            letterSpacing: "0.08em",
            marginBottom: "1.5em",
            textShadow: "0 2px 8px #b4b4d830",
            fontFamily: "'Bebas Neue', 'Montserrat', 'Noto Sans JP', 'Helvetica Neue', Arial, 'メイリオ', sans-serif"
          }}
        >
          この内容で下書き保存します。よろしいですか？
        </h2>
        {/* 必要に応じて内容のプレビューをここに表示 */}
        <div
          style={{
            background: "#f8faff",
            borderRadius: "12px",
            boxShadow: "0 2px 12px #b4b4d820",
            padding: "1.5em 1em",
            marginBottom: "1.5em",
            textAlign: "left",
            maxWidth: 600,           // 横幅を少し広く
            margin: "0 auto 1.5em auto"
          }}
        >
          <div style={{ marginBottom: "0.7em", fontWeight: 700, color: "#5a5af0" }}>
            タイトル:{" "}
            <span style={{ color: "#23263a", fontWeight: 500 }}>{query.title}</span>
          </div>
          <div style={{ marginBottom: "0.7em", fontWeight: 700, color: "#5a5af0" }}>
            日付:{" "}
            <span style={{ color: "#23263a", fontWeight: 500 }}>{query.date}</span>
          </div>
          <div style={{ marginBottom: "0.7em", fontWeight: 700, color: "#5a5af0" }}>
            場所:{" "}
            <span style={{ color: "#23263a", fontWeight: 500 }}>{query.location}</span>
          </div>
          <div style={{ marginBottom: "0.7em", fontWeight: 700, color: "#5a5af0" }}>
            カテゴリ:{" "}
            <span style={{ color: "#23263a", fontWeight: 500 }}>{query.category}</span>
          </div>
          <div style={{ marginBottom: "0.7em", fontWeight: 700, color: "#7f5af0" }}>
            キーワード:{" "}
            <span style={{ color: "#23263a", fontWeight: 500 }}>
              {Array.isArray(query.keywords) ? query.keywords.join(", ") : query.keywords}
            </span>
          </div>
          <div style={{ marginBottom: "0.7em", fontWeight: 700, color: "#2cb67d" }}>
            概要:{" "}
            <span style={{ color: "#23263a", fontWeight: 500 }}>{query.summary}</span>
          </div>
          <div style={{ marginBottom: "0.7em", fontWeight: 700, color: "#2cb67d" }}>
            詳細:{" "}
            <span style={{ color: "#23263a", fontWeight: 500 }}>{query.detail}</span>
          </div>
          <div style={{ marginBottom: "0.7em", fontWeight: 700, color: "#5a5af0" }}>
            最大人数:{" "}
            <span style={{ color: "#23263a", fontWeight: 500 }}>{query.max_participants}</span>
          </div>
          <div style={{ marginBottom: "0.7em", fontWeight: 700, color: "#5a5af0" }}>
            締切:{" "}
            <span style={{ color: "#23263a", fontWeight: 500 }}>{query.deadline}</span>
          </div>
        </div>
        {imageUrl && (
          <img
            src={imageUrl}
            alt="プレビュー画像"
            style={{
              maxWidth: "320px",
              borderRadius: "10px",
              boxShadow: "0 2px 12px #b4b4d820",
              marginBottom: "1em"
            }}
          />
        )}
        {/* ボタン */}
        <div style={{ marginTop: "2em", display: "flex", justifyContent: "center", gap: "2em" }}>
          <button
            onClick={handleBack}
            style={{
              background: "#e0e7ef",
              color: "#23263a",
              border: "1.5px solid #b4b4d8",
              borderRadius: "8px",
              padding: "0.8em 2em",
              fontWeight: "bold",
              fontSize: "1.05em",
              cursor: "pointer",
              boxShadow: "0 2px 8px #b4b4d820",
              letterSpacing: "0.05em"
            }}
          >
            戻る
          </button>
          <button
            onClick={handleSave}
            style={{
              background: "linear-gradient(90deg, #5a5af0 0%, #b4b4d8 100%)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "0.8em 2em",
              fontWeight: "bold",
              fontSize: "1.1em",
              cursor: "pointer",
              letterSpacing: "0.08em",
              boxShadow: "0 2px 12px #b4b4d820"
            }}
          >
            下書き保存
          </button>
        </div>
      </div>
    </div>
  );
}
