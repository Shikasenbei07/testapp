import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getValidId } from "../utils/getValidId";

const API_URL_GET_USER = process.env.NEXT_PUBLIC_API_URL_GET_USER;

export function useMyPageUser() {
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
      body: JSON.stringify({ id: id }),
    })
      .then(async res => {
        if (!res.ok) {
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

  return { lName, profileImg, loading, error };
}