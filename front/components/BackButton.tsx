import { useRouter } from "next/router";

export default function BackButton() {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
        router.back();
    } else {
        router.push("/");
    }
  };

  return (
    <button onClick={handleBack} style={{ marginTop: "1rem" }}>
      戻る
    </button>
  );
}
