import { useEffect, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { getValidId } from "../../../utils/getValidId";

export default function EventDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const event_id = params?.event_id;
  const participated = searchParams.get('participated');
  const [id, setId] = useState("");

  useEffect(() => {
    let validId = getValidId();
    setId(validId ?? "");
  }, []);

  const [event, setEvent] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!event_id) return;
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
  }, [event_id]);

  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!event) return <div>読み込み中...</div>;

  // ここでeventの中身を確認
  console.log(event);
  console.log("event:", event);
  console.log("current_participants:", event.current_participants);
  console.log("max_participants:", event.max_participants);

  // 以降、participatedContentの判定など...
  let participatedContent;
  if (participated === "1") {
    participatedContent = (
      <div style={{ color: "#1976d2", margin: "1rem 0" }}>
        無事に１を受け取りました
      </div>
    );
  } else if (participated === "0") {
    // current_participantsとmax_participantsを数値で比較
    const current = Number(event.current_participants);
    const max = Number(event.max_participants);

    if (
      !isNaN(current) &&
      !isNaN(max) &&
      max > 0 &&
      current >= max
    ) {
      participatedContent = (
        <div style={{ color: "#a10000", margin: "1rem 0" }}>
          参加予定人数に達しました
        </div>
      );
    } else {
      participatedContent = (
        <button style={{ margin: "1rem 0" }}>参加</button>
      );
    }
  } else {
    participatedContent = (
      <div style={{ color: "#a10000", margin: "1rem 0" }}>
        パラメータがありません
      </div>
    );
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
      {participatedContent}
      <button onClick={() => router.back()}>戻る</button>
    </div>
  );
}