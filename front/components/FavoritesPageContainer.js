import FavoritesTable from "./FavoritesTable";
import { handleRemoveFavorite, handleDetail, handleBack } from "../utils/favoriteHandlers";

export default function FavoritesPageContainer({ favorites, setFavorites, loading }) {
  return (
    <div style={favoritesPageStyle}>
      <h2 style={headingStyle}>お気に入りイベント一覧</h2>
      {loading ? (
        <div style={loadingStyle}>読み込み中...</div>
      ) : favorites.length === 0 ? (
        <div style={emptyStyle}>お気に入りはありません。</div>
      ) : (
        <FavoritesTable
          favorites={favorites}
          onRemove={event_id => handleRemoveFavorite(event_id, favorites, setFavorites)}
          onDetail={handleDetail}
        />
      )}
      <button
        style={backButtonStyle}
        onClick={handleBack}
      >
        戻る
      </button>
    </div>
  );
}

// --- スタイル定義 ---
const favoritesPageStyle = {
  maxWidth: 700,
  margin: "60px auto",
  background: "#fff",
  borderRadius: 12,
  boxShadow: "0 4px 24px #0001",
  padding: 36,
  position: "relative"
};

const headingStyle = {
  textAlign: "center",
  color: "#00c2a0",
  fontWeight: 700,
  marginBottom: 32
};

const loadingStyle = {
  textAlign: "center",
  color: "#00c2a0"
};

const emptyStyle = {
  textAlign: "center",
  color: "#888"
};

const backButtonStyle = {
  position: "fixed",
  right: 40,
  bottom: 40,
  padding: "12px 32px",
  background: "#00c2a0",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontWeight: 700,
  cursor: "pointer",
  fontSize: "1.08rem",
  boxShadow: "0 2px 8px #0002",
  zIndex: 1000
};