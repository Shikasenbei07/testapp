import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import InquiryForm from "../components/InquiryForm"; // 追加
import getEventDetail from "./api/getEventDetail";
import sendInquiry from "./api/sendInquiry";

export default function InquiryPage() {
  const router = useRouter();
  const eventId = router.query.event_id || "2";
  
  const [creatorName, setCreatorName] = useState("");

  const [eventTitle, setEventTitle] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [destination, setDestination] = useState("");
  const [sender, setSender] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    const userId = typeof window !== "undefined" ? localStorage.getItem("id") : "";
    setSender(userId || "");

    // イベント情報取得
    async function fetchDetail() {
      setLoading(true);
      try {
        const eventData = await getEventDetail(eventId);
        setEventTitle(eventData.event_title || "");
        setCreatorName(eventData.creator_name || "");
        setDestination(eventData.creator_id || "");
      } catch (e) {
        setError("イベント情報の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [router.isReady, eventId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("件名と本文は必須です。");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await sendInquiry(null, eventId, title, content, destination, sender);
      let result;
      try {
        result = JSON.parse(res);
      } catch {
        setError("サーバーから不正なレスポンスが返されました。");
        return;
      }
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push("/m-success");
    } catch (error) {
      setError("送信中にエラーが発生しました。もう一度お試しください。" + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push("/detail/" + eventId);
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 500, margin: "0 auto", padding: 20 }}>
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <InquiryForm
      eventTitle={eventTitle}
      creatorName={creatorName}
      title={title}
      setTitle={setTitle}
      content={content}
      setContent={setContent}
      error={error}
      submitting={submitting}
      handleSubmit={handleSubmit}
      handleBack={handleBack}
    />
  );
}