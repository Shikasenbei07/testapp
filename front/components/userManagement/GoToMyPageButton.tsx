import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getValidId } from "../../utils/getValidId";

export default function GoToMyPageButton({ targetId }) {
  const [showButton, setShowButton] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedId = getValidId();
    if (storedId && storedId === targetId) {
      setShowButton(true);
    }
  }, [targetId]);

  if (!showButton) return null;

  return (
    <button
      style={{ marginTop: "1.5rem", padding: "0.5rem 1rem", fontSize: "1rem" }}
      onClick={() => router.push("/mypage")}
    >
      マイページへ
    </button>
  );
}
