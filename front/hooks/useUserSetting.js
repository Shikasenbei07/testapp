import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getValidId } from "../utils/getValidId";

const API_URL_GET_USER = process.env.NEXT_PUBLIC_API_URL_GET_USER;
const API_URL_UPDATE_USER = process.env.NEXT_PUBLIC_API_URL_UPDATE_USER;

export function useUserSetting() {
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
  const [handleName, setHandleName] = useState("");
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
        setPreview(data.profile_img ?? null);
        setHandleName(data.handle_name ?? "");
        setLoading(false);
      })
      .catch(() => {
        setError("ユーザ情報取得エラー");
        setLoading(false);
      });
  }, [router]);

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

  const handleChange = (key, value) => {
    switch (key) {
      case "secondEmail": setSecondEmail(value); break;
      case "tel": setTel(value); break;
      case "lName": setLName(value); break;
      case "fName": setFName(value); break;
      case "lNameFuri": setLNameFuri(value); break;
      case "fNameFuri": setFNameFuri(value); break;
      case "birthday": setBirthday(value); break;
      case "handleName": setHandleName(value); break;
      default: break;
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const id = localStorage.getItem("id");
    if (!id) {
      setError("ログイン情報がありません");
      return;
    }

    let imgUrl = preview;

    if (profileImg && profileImg instanceof File) {
      const formData = new FormData();
      formData.append("id", id);
      formData.append("profile_img", profileImg);
      await fetch(API_URL_UPDATE_USER, {
        method: "PATCH",
        body: formData,
      });
    }

    const res = await fetch(API_URL_UPDATE_USER, {
      method: "PATCH",
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
        handle_name: handleName,
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

  return {
    email, setEmail,
    secondEmail, setSecondEmail,
    tel, setTel,
    lName, setLName,
    fName, setFName,
    lNameFuri, setLNameFuri,
    fNameFuri, setFNameFuri,
    birthday, setBirthday,
    profileImg, setProfileImg,
    preview, setPreview,
    loading, error, success,
    handleName, setHandleName,
    handleChange,
    handleImgChange,
    handleSubmit,
  };
}