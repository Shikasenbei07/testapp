import React from "react";

export default function UserSettingForm({
  email,
  secondEmail,
  tel,
  lName,
  fName,
  lNameFuri,
  fNameFuri,
  birthday,
  handleName, // 追加
  preview,
  success,
  error,
  onChange,
  onImgChange,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} style={formStyle}>
      <div style={fieldStyle}>
        <label>表示名</label>
        <input
          type="text"
          value={handleName}
          onChange={e => onChange("handleName", e.target.value)}
          style={inputStyle}
        />
      </div>
      <div style={fieldStyle}>
        <label>メールアドレス</label>
        <input
          type="email"
          value={email}
          disabled
          style={inputDisabledStyle}
        />
      </div>
      <div style={fieldStyle}>
        <label>サブメールアドレス</label>
        <input
          type="email"
          value={secondEmail}
          onChange={e => onChange("secondEmail", e.target.value)}
          style={inputStyle}
        />
      </div>
      <div style={fieldStyle}>
        <label>電話番号</label>
        <input
          type="tel"
          value={tel}
          onChange={e => onChange("tel", e.target.value)}
          style={inputStyle}
        />
      </div>
      <div style={fieldStyle}>
        <label>姓</label>
        <input
          type="text"
          value={lName}
          onChange={e => onChange("lName", e.target.value)}
          style={inputStyle}
        />
      </div>
      <div style={fieldStyle}>
        <label>名</label>
        <input
          type="text"
          value={fName}
          onChange={e => onChange("fName", e.target.value)}
          style={inputStyle}
        />
      </div>
      <div style={fieldStyle}>
        <label>姓（ふりがな）</label>
        <input
          type="text"
          value={lNameFuri}
          onChange={e => onChange("lNameFuri", e.target.value)}
          style={inputStyle}
        />
      </div>
      <div style={fieldStyle}>
        <label>名（ふりがな）</label>
        <input
          type="text"
          value={fNameFuri}
          onChange={e => onChange("fNameFuri", e.target.value)}
          style={inputStyle}
        />
      </div>
      <div style={fieldStyle}>
        <label>生年月日</label>
        <input
          type="date"
          value={birthday}
          onChange={e => onChange("birthday", e.target.value)}
          style={inputStyle}
        />
      </div>
      <div style={fieldStyle}>
        <label>プロフィール画像</label>
        <input type="file" accept="image/*" onChange={onImgChange} />
        {preview && (
          <div style={{ marginTop: 8 }}>
            <img src={preview} alt="preview" style={imgStyle} />
          </div>
        )}
      </div>
      <button type="submit" style={buttonStyle}>
        保存
      </button>
      {success && <div style={successStyle}>{success}</div>}
      {error && <div style={errorStyle}>{error}</div>}
    </form>
  );
}

// スタイル定義
const formStyle = {};
const fieldStyle = { marginBottom: 16 };
const inputStyle = { width: "100%", padding: 8, marginTop: 4 };
const inputDisabledStyle = { ...inputStyle, background: "#eee" };
const buttonStyle = { width: "100%", padding: 10, background: "#00c2a0", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700 };
const imgStyle = { width: 120, height: 120, objectFit: "cover", borderRadius: "50%" };
const successStyle = { color: "green", marginTop: 12 };
const errorStyle = { color: "red", marginTop: 12 };