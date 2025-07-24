import { useState } from "react";
import { useRouter } from "next/router";

const API_URL_LOGIN = process.env.NEXT_PUBLIC_API_URL_LOGIN;

export function useLogin() {
  const [form, setForm] = useState({ id: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [displayError, setDisplayError] = useState("");
  const router = useRouter();
  const validity_time = 60 * 60 * 1000;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDisplayError("");
    setLoading(true);
    try {
      const res = await fetch(API_URL_LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: form.id, password: form.password }),
      });
      const data = await res.json();
      if (data && !data.error && typeof window !== "undefined") {
        const expire = Date.now() + validity_time;
        localStorage.setItem("id", data.id);
        localStorage.setItem("id_expire", expire);
        router.push("/event");
      } else if (data && data.error) {
        setDisplayError("ログイン失敗: " + data.error);
      } else {
        setDisplayError("ログインに失敗しました。");
      }
    } catch (err) {
      setDisplayError("通信エラー: " + err.message);
    } finally {
      setLoading(false);
      setForm((prev) => ({ ...prev, password: "" }));
    }
  };

  return {
    form,
    handleChange,
    handleSubmit,
    loading,
    displayError,
  };
}