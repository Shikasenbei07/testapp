import { useState } from "react";
import { useRouter } from "next/router";
import useApiRequest from "./useApiRequest";

const API_URL_LOGIN = process.env.NEXT_PUBLIC_API_URL_LOGIN;

export function useLogin() {
  const [form, setForm] = useState({ id: "", password: "" });
  const [requestBody, setRequestBody] = useState(null);
  const [error, setError] = useState("");
  const router = useRouter();
  const validity_time = 60 * 60 * 1000;

  const { data, loading, error: apiError } = useApiRequest(
    requestBody ? API_URL_LOGIN : null,
    requestBody
      ? {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      : null
  );

  // ログイン成功時の処理
  if (data && !error && typeof window !== "undefined") {
    const expire = Date.now() + validity_time;
    localStorage.setItem("id", data.id);
    localStorage.setItem("id_expire", expire);
    router.push("/event");
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setRequestBody({ id: form.id, password: form.password });
    setForm((prev) => ({ ...prev, password: "" }));
  };

  let displayError = error || apiError;
  if (data && data.error) {
    displayError = "ログイン失敗: " + data.error;
  }

  return {
    form,
    handleChange,
    handleSubmit,
    loading,
    displayError,
  };
}