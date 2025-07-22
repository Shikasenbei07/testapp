import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getValidId } from "../../../utils/getValidId";

export default function EventDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { event_id, id: queryId } = router.query;
  const participated = searchParams.get('participated');
  const [id, setId] = useState("");

  useEffect(() => {
    // participatedの値をコンソールに表示
    console.log("participated:", participated);
  }, [participated]);

  useEffect(() => {
    if (!router.isReady) return;
    let validId = queryId;
    if (!validId) {
      validId = getValidId();
    }
    setId(validId ?? "");
  }, [queryId, router]);

  const [event, setEvent] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!router.isReady || !event_id) return;
    fetch(`https://0x0-showevent-hbbadxcxh9a4bzhu.japaneast-01.azurewebsites.net/api/showevent?code=KjUCLx4igb6FiJ3ZtQKowVUUk9MgUtPSuBhPrMam2RwxAzFuTt1T_w%3D%3D&event_id=${event_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setEvent(data[0]);
        } else {
          setEvent(data);
        }
      })
      .catch((err) => {
        setError("データ取得エラー: " + err.message);
      });
  }, [event_id, router.isReady]);

  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!event) return <div>読み込み中...</div>;

  let participatedContent;
  if (participated === "1") {
    participatedContent = (
      <div style={{ color: "#1976d2", margin: "1rem 0" }}>
        無事に１を受け取りました
      </div>
    );
  } else if (participated === "0") {
    participatedContent = null;
  } else if (participated === null || typeof participated === "undefined") {
    participatedContent = (
      <div style={{ color: "#a10000", margin: "1rem 0" }}>
        パラメータがありません
      </div>
    );
  } else {
    participatedContent = <div>参加状況確認中...</div>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>イベント詳細</h1>
      <table border="1" cellPadding="8">
        <tbody>
          <tr>
            <th>タイトル</th>
            <td>{event.event_title}</td>
          </tr>
          <tr>
            <th>日時</th>
            <td>{event.event_datetime}</td>
          </tr>
          <tr>
            <th>締切</th>
            <td>{event.deadline}</td>
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
      {event.image && (
        <div>
          <img src={event.image} alt="イベント画像" style={{ maxWidth: "100%" }} />
        </div>
      )}
      <button onClick={() => router.back()}>戻る</button>
      
    </div>
  );
}