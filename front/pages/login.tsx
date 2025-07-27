import { useRouter } from "next/router";
import { useEffect } from "react";
import LoginForm from "../components/LoginForm";
import { useLogin } from "../hooks/login/useLogin";

export default function LoginPage() {
  const router = useRouter();
  const { userId, loading, error, submitLogin } = useLogin();

  useEffect(() => {
    const stored = localStorage.getItem("id");
    if (stored) router.replace("/event");
  }, []);

  useEffect(() => {
    if (userId) router.push("/event");
  }, [userId, router]);

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto" }}>
      <h1>ログイン</h1>
      <LoginForm submitLogin={submitLogin} loading={loading} error={error} />
    </div>
  );
}
