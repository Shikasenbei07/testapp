import { useUser } from "../../hooks/userManagement/useUser";
import GoToMyPageButton from "./GoToMyPageButton";

export default function UserProfile({ id }) {
  const { user, loading, error } = useUser(id);

  if (loading) return <p>読み込み中...</p>;
  if (!user) return <p style={{ textAlign: 'center' }}>ユーザーが見つかりません</p>;
  if (error) return <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center' }}>
        {user.profileImg && (
          <div style={{ marginBottom: 16 }}>
            <img
              src={user.profileImg}
              alt="プロフィール画像"
              style={{ width: 120, height: 120, objectFit: "cover", borderRadius: "50%" }}
            />
          </div>
        )}
        <div style={{ fontWeight: "bold", fontSize: "1.6rem", marginBottom: "1rem" }}>
          {user.handleName}
        </div>
        <div style={{ fontSize: "1.1rem" }}>
          {user.lName} {user.fName}
        </div>

        <GoToMyPageButton targetId={id} />
      </div>
    </div>
  );
}
