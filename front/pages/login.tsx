import { useRouter } from "next/router";
import LoginForm from "../components/login/LoginForm";
import { useLoginForm } from "../hooks/login/useLoginForm";

export default function LoginPage() {
  const router = useRouter();
  const {
      formData,
      handleChange,
      handleSubmit,
      loading,
      error,
    } = useLoginForm();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleSubmit();
    if (success) {
      router.push("/event");
    }
  };

  
  return (
    <div style={{ maxWidth: 400, margin: "2rem auto" }}>
      <h1>ログイン</h1>
      <LoginForm 
        onSubmit={onSubmit}
        formData={formData}
        handleChange={handleChange}
        loading={loading}
        error={error}
      />
    </div>
  );
}
