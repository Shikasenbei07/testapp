import { get } from "http";
import { getValidId } from "./getValidId";

export function showRemoveFavoritePopup() {
  return new Promise((resolve) => {
    const popup = document.createElement("div");
    popup.style.position = "fixed";
    popup.style.left = 0;
    popup.style.top = 0;
    popup.style.width = "100vw";
    popup.style.height = "100vh";
    popup.style.background = "rgba(0,0,0,0.25)";
    popup.style.zIndex = 9999;
    popup.style.display = "flex";
    popup.style.alignItems = "center";
    popup.style.justifyContent = "center";

    popup.innerHTML = `
      <div style="
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 4px 24px #0002;
        padding: 32px 36px 24px 36px;
        min-width: 320px;
        text-align: center;
        font-size: 1.08rem;
      ">
        <div style="color:#222; margin-bottom: 24px;">
          このイベントをお気に入りから解除しますか？
        </div>
        <button id="popup-ok" style="
          background: #ff6666;
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 8px 32px;
          font-weight: 700;
          font-size: 1rem;
          margin-right: 16px;
          cursor: pointer;
        ">解除</button>
        <button id="popup-cancel" style="
          background: #e0e0e0;
          color: #333;
          border: none;
          border-radius: 6px;
          padding: 8px 32px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
        ">キャンセル</button>
      </div>
    `;

    document.body.appendChild(popup);

    const okBtn = popup.querySelector("#popup-ok");
    const cancelBtn = popup.querySelector("#popup-cancel");

    function onOk() {
      cleanup();
      resolve(true);
    }
    function onCancel() {
      cleanup();
      resolve(false);
    }

    const cleanup = () => {
      if (popup.parentNode) {
        document.body.removeChild(popup);
      }
      okBtn.removeEventListener("click", onOk);
      cancelBtn.removeEventListener("click", onCancel);
    };

    okBtn.addEventListener("click", onOk);
    cancelBtn.addEventListener("click", onCancel);
  });
}

export function handleDetail(item) {
  window.location.href = `/event/detail/${item.event_id}`;
}

export function handleBack() {
  window.location.href = "/mypage";
}

export async function handleRemoveFavorite(event_id, user_id, favorites, setFavorites) {
  const confirmed = await showRemoveFavoritePopup();
  if (!confirmed) return false;

  // 配列保証
  const safeFavorites = Array.isArray(favorites) ? favorites : [];
  // setFavoritesが関数かチェック
  if (typeof setFavorites !== "function") {
    alert("お気に入り状態の更新関数が見つかりません");
    return false;
  }

  const API_URL_REMOVE_FAVORITE = process.env.NEXT_PUBLIC_API_URL_REMOVE_FAVORITE;
  const res = await fetch(API_URL_REMOVE_FAVORITE, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      event_id,
      id: getValidId(),
    }),
  });
  if (res.ok) {
    setFavorites(favorites.filter(item => String(item.event_id) !== String(event_id)));
    return true;
  } else {
    alert("解除に失敗しました");
    return false;
  }
}