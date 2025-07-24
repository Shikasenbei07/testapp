import { useLogin } from "../hooks/useLogin";
import LoginForm from "../components/LoginForm";

export default function Login() {
  const { form, handleChange, handleSubmit, loading, displayError } = useLogin();

  return (
    <LoginForm
      form={form}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      loading={loading}
      displayError={displayError}
    />
  );
}

// getServerSidePropsを削除（静的生成を許可）