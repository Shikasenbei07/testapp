import React, { useState } from "react";
import { useRouter } from "next/router";
import MyIcon from "./MyIcon";

// SideMenu.jsと同じ項目
const menuItems = [
  { label: "イベント一覧", path: "/event" },
  { label: "イベント作成", path: "/event/create" },
  { label: "マイページ", path: "/mypage" },
  { label: "ログアウト", path: "" }
];

export default function Header() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header style={headerStyle}>
        <div style={leftAreaStyle}>
          {/* メニューはログイン画面以外で表示 */}
          {router.pathname !== "/login" && (
            <button style={menuButtonStyle} onClick={() => setMenuOpen(true)}>
              メニュー
            </button>
          )}
          {/* タイトル画像は常に表示 */}
          <span
            style={{ marginLeft: "1rem", fontWeight: "bold", fontSize: "1.2rem", cursor: "pointer" }}
            onClick={() => router.push("/")}
          >
            <img src="/img/title.png" alt="タイトル" style={{ height: "32px", verticalAlign: "middle" }} />
          </span>
        </div>
        <div style={rightAreaStyle}>
          {router.pathname !== "/login" && (
            <div style={logoStyle}>
              <MyIcon style={iconStyle} />
            </div>
          )}
        </div>
      </header>
      {/* サイドメニュー */}
      <div
        style={{
          ...sideMenuStyle,
          left: menuOpen ? 0 : "-260px",
        }}
      >
        <button style={closeButtonStyle} onClick={() => setMenuOpen(false)}>
          ×
        </button>
        <ul style={sideMenuListStyle}>
          {menuItems.map(item => (
            <li
              key={item.path}
              style={sideMenuItemStyle}
              onClick={() => {
                if (item.label === "ログアウト") {
                  localStorage.clear();
                  router.push("/login");
                  setMenuOpen(false);
                } else {
                  router.push(item.path);
                  setMenuOpen(false);
                }
              }}
            >
              {item.label}
            </li>
          ))}
        </ul>
      </div>
      {/* サイドメニュー表示時の背景 */}
      {menuOpen && <div style={sideMenuOverlayStyle} onClick={() => setMenuOpen(false)} />}
    </>
  );
}

// スタイル分離
const headerStyle = {
  width: "100%",
  background: "#d1c4e9", // 少し濃い紫系に変更
  color: "#4a148c",
  padding: "0.7rem 2rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
  position: "sticky",
  top: 0,
  zIndex: 1000
};

const leftAreaStyle = {
  display: "flex",
  alignItems: "center",
  gap: "2rem"
};

const rightAreaStyle = {
  display: "flex",
  alignItems: "center",
  gap: "1rem"
};

const logoStyle = {
  fontWeight: "bold",
  cursor: "pointer",
  display: "flex",
  alignItems: "center"
};

const iconStyle = {
  marginRight: "0.5rem"
};

const menuButtonStyle = {
  background: "#fff",
  color: "#4a148c",
  border: "none",
  padding: "0.5rem 1rem",
  borderRadius: "4px",
  cursor: "pointer",
  fontWeight: "bold"
};

const sideMenuStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "260px",
  height: "100vh",
  background: "#fff",
  boxShadow: "2px 0 8px rgba(0,0,0,0.15)",
  zIndex: 2000,
  transition: "left 0.3s",
  padding: "2rem 1rem 1rem 1rem",
  display: "flex",
  flexDirection: "column"
};

const closeButtonStyle = {
  background: "none",
  border: "none",
  fontSize: "2rem",
  color: "#4a148c",
  cursor: "pointer",
  alignSelf: "flex-end",
  marginBottom: "2rem"
};

const sideMenuListStyle = {
  listStyle: "none",
  padding: 0,
  margin: 0,
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem"
};

const sideMenuItemStyle = {
  color: "#4a148c",
  fontWeight: "bold",
  cursor: "pointer",
  fontSize: "1.1rem"
};

const sideMenuOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.2)",
  zIndex: 1999
};