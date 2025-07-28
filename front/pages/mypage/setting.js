import { useUserSetting } from "../../hooks/useUserSetting";
import UserSettingForm from "../../components/UserSettingForm";
import { useRouter } from "next/router";

export default function Setting() {
  const {
    email, secondEmail, tel, lName, fName, lNameFuri, fNameFuri, birthday,
    handleName, // 追加
    preview, loading, error, success,
    handleChange, handleImgChange, handleSubmit
  } = useUserSetting();
  const router = useRouter();

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div style={errorStyle}>{error}</div>;

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>ユーザ情報設定</h2>
      <UserSettingForm
        email={email}
        secondEmail={secondEmail}
        tel={tel}
        lName={lName}
        fName={fName}
        lNameFuri={lNameFuri}
        fNameFuri={fNameFuri}
        birthday={birthday}
        handleName={handleName} // 追加
        preview={preview}
        success={success}
        error={error}
        onChange={handleChange}
        onImgChange={handleImgChange}
        onSubmit={handleSubmit}
      />
      <button
        type="button"
        style={backButtonStyle}
        onClick={() => router.push("/mypage")}
      >
        マイページに戻る
      </button>
    </div>
  );
}

// スタイル定義
const containerStyle = {
  maxWidth: 400,
  margin: "40px auto",
  background: "#fff",
  borderRadius: 12,
  boxShadow: "0 4px 24px #0001",
  padding: 36,
};
const titleStyle = {
  textAlign: "center",
  marginBottom: 24,
};
const backButtonStyle = {
  width: "100%",
  marginTop: 16,
  padding: 10,
  background: "#eee",
  color: "#333",
  border: "none",
  borderRadius: 6,
};
const errorStyle = { color: "red", marginTop: 16 };