<<<<<<< HEAD
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getValidId } from "../../utils/getValidId";

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
        setPreview(data.profile_img ?? null);
        setLoading(false);
      })
      .catch(() => {
        setError("ユーザ情報取得エラー");
        setLoading(false);
      });
  }, []);

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
      const res = await fetch(API_URL_UPLOAD_PROFILE_IMG, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        setError("画像アップロード失敗");
        return;
      }
      const data = await res.json();
      imgUrl = data.url;
    }

    const res = await fetch(API_URL_UPDATE_USER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, l_name: lName, profile_img: imgUrl }),
    });

    if (res.ok) {
      setSuccess("更新しました");
      if (imgUrl) setPreview(imgUrl);
    } else {
      const errText = await res.text();
      setError("更新に失敗しました: " + errText);
    }
  }

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div style={styles.error}>{error}</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>ユーザ情報設定</h2>
      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label>メールアドレス：{email}</label>
          <input
            type="email"
            value={secondEmail}
            placeholder="サブメールアドレス"
            onChange={e => setSecondEmail(e.target.value)}
            style={styles.input}
          />
          <input
            type="tel"
            value={tel}
            placeholder="電話番号"
            onChange={e => setTel(e.target.value)}
            style={styles.input}
          />
          <input
            type="text"
            value={lName}
            placeholder="姓"
            onChange={e => setLName(e.target.value)}
            style={styles.input}
          />
          <input
            type="text"
            value={fName}
            placeholder="名"
            onChange={e => setFName(e.target.value)}
            style={styles.input}
          />
          <input
            type="text"
            value={lNameFuri}
            placeholder="姓フリガナ"
            onChange={e => setLNameFuri(e.target.value)}
            style={styles.input}
          />
          <input
            type="text"
            value={fNameFuri}
            placeholder="名フリガナ"
            onChange={e => setFNameFuri(e.target.value)}
            style={styles.input}
          />
          <input
            type="date"
            value={birthday}
            onChange={e => setBirthday(e.target.value)}
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label>プロフィール画像</label>
          <input type="file" accept="image/*" onChange={handleImgChange} />
          {preview && (
            <div style={styles.previewWrapper}>
              <img src={preview} alt="preview" style={styles.previewImg} />
            </div>
          )}
        </div>
        <button type="submit" style={styles.saveButton}>保存</button>
        {success && <div style={styles.success}>{success}</div>}
        {error && <div style={styles.error}>{error}</div>}
      </form>
      <button type="button" style={styles.backButton} onClick={() => router.push("/mypage")}>
        マイページに戻る
      </button>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 400,
    margin: "40px auto",
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 4px 24px #0001",
    padding: 36,
  },
  heading: {
    textAlign: "center",
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  input: {
    width: "100%",
    padding: 8,
    marginTop: 4,
  },
  previewWrapper: {
    marginTop: 8,
  },
  previewImg: {
    width: 120,
    height: 120,
    objectFit: "cover",
    borderRadius: "50%",
  },
  saveButton: {
    width: "100%",
    padding: 10,
    background: "#00c2a0",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    fontWeight: 700,
  },
  backButton: {
    width: "100%",
    marginTop: 16,
    padding: 10,
    background: "#eee",
    color: "#333",
    border: "none",
    borderRadius: 6,
  },
  success: {
    color: "green",
    marginTop: 12,
  },
  error: {
    color: "red",
    marginTop: 12,
  },
};
=======
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getValidId } from "../../utils/getValidId";

const API_URL_GET_USER = process.env.NEXT_PUBLIC_API_URL_GET_USER;
const API_URL_UPDATE_USER = process.env.NEXT_PUBLIC_API_URL_UPDATE_USER;
const API_URL_UPLOAD_PROFILE_IMG = process.env.NEXT_PUBLIC_API_URL_UPLOAD_PROFILE_IMG;

export default function Setting() {
  const [lName, setLName] = useState("");
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
        setLName(data.l_name ?? "");
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

    let imgUrl = preview; // 既存画像URLを初期値に
    if (profileImg && profileImg instanceof File) {
      // 画像アップロードAPI呼び出し例
      const formData = new FormData();
      formData.append("id", id);
      formData.append("profile_img", profileImg);
      const res = await fetch(API_URL_UPLOAD_PROFILE_IMG, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        setError("画像アップロード失敗");
        return;
      }
      const data = await res.json();
      imgUrl = data.url;
    }

    // ユーザ情報更新API呼び出し例
    const res = await fetch(API_URL_UPDATE_USER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, l_name: lName, profile_img: imgUrl }),
    });
    if (res.ok) {
      setSuccess("更新しました");
      if (imgUrl) setPreview(imgUrl);
    } else {
      const errText = await res.text();
      setError("更新に失敗しました: " + errText);
    }
  }

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", background: "#fff", borderRadius: 12, boxShadow: "0 4px 24px #0001", padding: 36 }}>
      <h2 style={{ textAlign: "center", marginBottom: 24 }}>ユーザ情報設定</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>表示名</label>
          <input
            type="text"
            value={lName}
            onChange={e => setLName(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>プロフィール画像</label>
          <input type="file" accept="image/*" onChange={handleImgChange} />
          {preview && (
            <div style={{ marginTop: 8 }}>
              <img src={preview} alt="preview" style={{ width: 120, height: 120, objectFit: "cover", borderRadius: "50%" }} />
            </div>
          )}
        </div>
        <button type="submit" style={{ width: "100%", padding: 10, background: "#00c2a0", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700 }}>
          保存
        </button>
        {success && <div style={{ color: "green", marginTop: 12 }}>{success}</div>}
        {error && <div style={{ color: "red", marginTop: 12 }}>{error}</div>}
      </form>
      <button
        type="button"
        style={{ width: "100%", marginTop: 16, padding: 10, background: "#eee", color: "#333", border: "none", borderRadius: 6 }}
        onClick={() => router.push("/mypage")}
      >
        マイページに戻る
      </button>
    </div>
  );
}
>>>>>>> e0b7a348d52970b95ca6fea657eb2169bc1364d3
