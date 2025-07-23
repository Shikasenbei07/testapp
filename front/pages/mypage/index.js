import { useRouter } from "next/router";
import { useMyPageUser } from "../../hooks/useMyPageUser";
import MypageProfile from "../../components/MypageProfile";
import MypageMenu from "../../components/MypageMenu";
import MypageFooter from "../../components/MypageFooter";
import { mypageNavigate, mypageLogout, mypageSetting } from "../../utils/mypageNavigation";

export default function MyPage() {
  const router = useRouter();
  const { lName, profileImg, loading, error } = useMyPageUser();

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: "2rem", background: "#f7faff", borderRadius: "16px", boxShadow: "0 2px 12px #1976d230", textAlign: "center" }}>
      <MypageProfile profileImg={profileImg} lName={lName} />
      <MypageMenu onNavigate={path => mypageNavigate(router, path)} />
      <MypageFooter onLogout={() => mypageLogout(router)} onSetting={() => mypageSetting(router)} />
    </div>
  );
}