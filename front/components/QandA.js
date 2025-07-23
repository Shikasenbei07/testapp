import { useState, useEffect, useRef } from "react";

const qaList = [
  { question: "ログインできない場合は？", answer: "パスワードを再設定してください。" },
  { question: "イベントの参加方法は？", answer: "イベント詳細ページから申し込みできます。" },
  // 他のQ&Aを追加
];

export default function QandA({ characterImg }) {
  const [open, setOpen] = useState(false);

  // 追加: キャラクターの位置管理
  const [pos, setPos] = useState({ x: window.innerWidth - 200, y: window.innerHeight - 200 });
  const direction = useRef({ x: 1, y: 1 });

  useEffect(() => {
    // ウィンドウサイズ取得
    const getMax = () => ({
      x: window.innerWidth - 180,
      y: window.innerHeight - 180,
    });

    const move = () => {
      setPos(prev => {
        let { x, y } = prev;
        let { x: dx, y: dy } = direction.current;
        const max = getMax();

        // 速度を上げる（例: 2 → 8）
        x += dx * 8;
        y += dy * 8;

        // 端で跳ね返る
        if (x < 0) {
          x = 0;
          direction.current.x = 1;
        } else if (x > max.x) {
          x = max.x;
          direction.current.x = -1;
        }
        if (y < 0) {
          y = 0;
          direction.current.y = 1;
        } else if (y > max.y) {
          y = max.y;
          direction.current.y = -1;
        }
        return { x, y };
      });
    };

    // インターバルはそのまま
    const interval = setInterval(move, 20);

    // ウィンドウリサイズ時に位置を調整
    const handleResize = () => {
      setPos(pos => {
        const max = getMax();
        return {
          x: Math.min(pos.x, max.x),
          y: Math.min(pos.y, max.y),
        };
      });
    };
    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <img
        src={characterImg}
        alt="キャラクター"
        style={{
          position: "fixed",
          left: pos.x,
          top: pos.y,
          width: "160px",
          height: "160px",
          borderRadius: "50%",
          boxShadow: "0 2px 12px #b4b4d820",
          cursor: "pointer",
          zIndex: 1000,
          transition: "left 0.04s linear, top 0.04s linear",
        }}
        onClick={() => setOpen(!open)}
      />
      {open && (
        <div
          style={{
            position: "fixed",
            left: pos.x,
            top: pos.y - 220,
            background: "#fff",
            borderRadius: "16px",
            boxShadow: "0 4px 24px #b4b4d880",
            padding: "1.5em",
            width: "320px",
            zIndex: 1001,
          }}
        >
          <h3 style={{ marginBottom: "1em", color: "#5a5af0" }}>よくある質問</h3>
          <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>
            {qaList.map((qa, idx) => (
              <li key={idx} style={{ marginBottom: "1em" }}>
                <strong>{qa.question}</strong>
                <div style={{ marginTop: "0.3em", color: "#23263a" }}>{qa.answer}</div>
              </li>
            ))}
          </ul>
          <button
            style={{
              marginTop: "1em",
              padding: "0.5em 1em",
              borderRadius: "8px",
              border: "1.5px solid #b4b4d8",
              background: "#e0e7ef",
              cursor: "pointer",
              fontWeight: "bold",
            }}
            onClick={() => setOpen(false)}
          >
            閉じる
          </button>
        </div>
      )}
    </>
  );
}