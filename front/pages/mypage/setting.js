import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getValidId } from "../../utils/getValidId";
import UserSettingForm from "../../components/UserSettingForm";

const API_URL_GET_USER = process.env.NEXT_PUBLIC_API_URL_GET_USER;
const API_URL_UPDATE_USER = process.env.NEXT_PUBLIC_API_URL_UPDATE_USER;
const API_URL_UPLOAD_PROFILE_IMG = process.env.NEXT_PUBLIC_API_URL_UPLOAD_PROFILE_IMG;

export default function Setting() {
  const [email, setEmail] = useState("");
  const [secondEmail, setSecondEmail] = useState("");
  const [tel, setTel] = useState("");
  const [lName, setLName] = useState("");
  const [fName, setFName] = useState("");
  const [lNameFuri, setLNameFuri] = useState("");
  const [fNameFuri, setFNameFuri] = useState("");
  const [birthday, setBirthday] = useState("");
  const [profileImg, setProfileImg] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    const id = getValidId();
    if (!id) {
      router.push("/login");
      return;
    }

    fetch(API_URL_GET_USER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
      .then(res => res.json())
      .then(data => {
        setEmail(data.email ?? "");
        setSecondEmail(data.second_email ?? "");
        setTel(data.tel ?? "");
        setLName(data.l_name ?? "");
        setFName(data.f_name ?? "");
        setLNameFuri(data.l_name_furi ?? "");
        setFNameFuri(data.f_name_furi ?? "");
        setBirthday(data.birthday ?? "");
        setProfileImg(data.profile_img ?? null);
        setPreview(data.profile_img ?? null); // 画像URLをプレビューにセット
        setLoading(false);
      })
      .catch(() => {
        setError("ユーザ情報取得エラー");
        setLoading(false);
      });
  }, []);

  // プロフィール画像プレビュー
  function handleImgChange(e) {
    const file = e.target.files[0];
    setProfileImg(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  }

  // ユーザ情報更新
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const id = localStorage.getItem("id");
    if (!id) {
      setError("ログイン情報がありません");
      return;
    }

    // let imgUrl = preview; // 既存画像URLを初期値に
    // if (profileImg && profileImg instanceof File) {
    //   // 画像アップロードAPI呼び出し例
    //   const formData = new FormData();
    //   formData.append("id", id);
    //   formData.append("profile_img", profileImg);
    //   const res = await fetch(API_URL_UPLOAD_PROFILE_IMG, {
    //     method: "POST",
    //     body: formData,
    //   });
    //   if (!res.ok) {
    //     setError("画像アップロード失敗");
    //     return;
    //   }
    //   const data = await res.json();
    //   imgUrl = data.url;
    // }

    // ユーザ情報更新API呼び出し例
    const res = await fetch(API_URL_UPDATE_USER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        email,
        second_email: secondEmail,
        tel,
        l_name: lName,
        f_name: fName,
        l_name_furi: lNameFuri,
        f_name_furi: fNameFuri,
        birthday,
        profile_img: imgUrl,
      }),
    });
    if (res.ok) {
      setSuccess("更新しました");
      if (imgUrl) setPreview(imgUrl);
    } else {
      const errText = await res.text();
      setError("更新に失敗しました: " + errText);
    }
  }

  // 値変更用ハンドラ
  const handleChange = (key, value) => {
    switch (key) {
      case "secondEmail": setSecondEmail(value); break;
      case "tel": setTel(value); break;
      case "lName": setLName(value); break;
      case "fName": setFName(value); break;
      case "lNameFuri": setLNameFuri(value); break;
      case "fNameFuri": setFNameFuri(value); break;
      case "birthday": setBirthday(value); break;
      default: break;
    }
  };

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