export default function MypageProfile({ profileImg, lName }) {
  return (
    <>
      {profileImg && (
        <div style={{ marginBottom: 16 }}>
          <img
            src={profileImg}
            alt="プロフィール画像"
            style={{ width: 120, height: 120, objectFit: "cover", borderRadius: "50%" }}
          />
        </div>
      )}
      <div style={{ fontWeight: "bold", fontSize: "1.2rem", marginBottom: "1.2rem" }}>
        {lName}さんのページ
      </div>
    </>
  );
}