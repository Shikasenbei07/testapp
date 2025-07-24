import { formatDateTime } from "../utils/formatDateTime";
import { useRouter } from "next/router";

export default function EventDetailTable({ event }) {
  const router = useRouter();

  // キーワードを #付きで連結し、クリックで遷移
  const keywordTags =
    Array.isArray(event.keywords) && event.keywords.length > 0
      ? event.keywords.map((kw, i) => (
          <span
            key={kw.keyword_id || kw}
            style={keywordTagStyle}
            onClick={() => {
              // キーワードをlocalStorageに保存
              const keywordValue = kw.keyword_name || kw;
              localStorage.setItem("eventSearchKeyword", keywordValue);
              router.push("/event");
            }}
          >
            #{kw.keyword_name || kw}
          </span>
        ))
      : "";

  return (
    <div>
      {/* キーワードを表の外に表示 */}
      {keywordTags && (
        <div style={keywordTagsWrapperStyle}>
          {keywordTags}
        </div>
      )}
      <table border="1" cellPadding="8">
        <tbody>
          <tr>
            <th>タイトル</th>
            <td>{event.event_title}</td>
          </tr>
          <tr>
            <th>日時</th>
            <td>{formatDateTime(event.event_datetime)}</td>
          </tr>
          <tr>
            <th>締切</th>
            <td>{formatDateTime(event.deadline)}</td>
          </tr>
          <tr>
            <th>場所</th>
            <td>{event.location}</td>
          </tr>
          <tr>
            <th>内容</th>
            <td>{event.content}</td>
          </tr>
          <tr>
            <th>説明</th>
            <td>{event.description}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// --- スタイル定義をページ末尾に分離 ---
const keywordTagStyle = {
  cursor: "pointer",
  color: "#1976d2",
  marginRight: 8,
  textDecoration: "underline",
};

const keywordTagsWrapperStyle = {
  marginBottom: "1rem",
  fontWeight: "bold",
  color: "#1976d2",
};