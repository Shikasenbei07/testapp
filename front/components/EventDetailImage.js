export default function EventDetailImage({ src, alt }) {
  if (!src) return null;
  return (
    <div>
      <img
        src={src}
        alt={alt || "イベント画像"}
        style={{ maxWidth: "100%" }}
      />
    </div>
  );
}