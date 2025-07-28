import { useRouter } from "next/router";
import UserProfile from "../../components/userManagement/UserProfile";
import BackButton from "../../components/BackButton";

export default function UserProfilePage() {
  const router = useRouter();
  const { id } = router.query;

  if (typeof id !== "string") {
    return <p>ユーザーIDが不正です</p>;
  }

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto" }}>
      <h1>ユーザープロフィール</h1>
      <UserProfile id={id} />
      <BackButton />
    </div>
  );
}
