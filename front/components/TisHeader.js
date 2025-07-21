import React from "react";

export default function TisHeader() {
  return (
    <header
      style={{
        width: "100%",
        background: "linear-gradient(90deg, #5a5af0 0%, #b4b4d8 100%)",
        padding: "1.2em 0",
        textAlign: "center",
        boxShadow: "0 2px 12px #b4b4d820",
        marginBottom: 0 // ここを0に変更
      }}
    >
      <span
        style={{
          color: "#fff",
          fontWeight: 900,
          fontSize: "1.7em",
          letterSpacing: "0.12em",
          fontFamily: "'Bebas Neue', 'Montserrat', 'Noto Sans JP', 'Helvetica Neue', Arial, 'メイリオ', sans-serif",
          textShadow: "0 2px 8px #5a5af080"
        }}
      >
        豊田自動織機ITソリューションズ
      </span>
    </header>
  );
}