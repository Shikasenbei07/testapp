import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { formatDateTime } from "../../utils/formatDateTime";

const API_URL_GET_INQUIRY_DETAILS = process.env.NEXT_PUBLIC_API_URL_GET_INQUIRY_DETAILS;

export default function InquiryDetail() {
  const [inquiry, setInquiry] = useState(null);
  const router = useRouter();

  // URLパラメータから取得
  const hashedInquiryId = router.asPath.split("/").pop();

  useEffect(() => {
    if (!hashedInquiryId) return;
    async function fetchInquiry() {
      const res = await fetch("http://localhost:7071/api/get_inquiry_details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hashed_inquiry_id: hashedInquiryId }),
      });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setInquiry(data); // 配列全体をセット
      }
    }
    fetchInquiry();
  }, [hashedInquiryId]);

  const userId = localStorage.getItem("id");
  if (!inquiry || inquiry.length === 0 || (inquiry[0].destination != userId && inquiry[0].sender != userId)) {
    return <div>データがありません。</div>;
  }

  return (
    <div>
      <h2>問い合わせ詳細</h2>
      <div>イベント名: {inquiry[0].event_title}</div>
      <div>イベント作成者: {inquiry[0].destination_name}</div>
      <div>件名: {inquiry[0].inquiry_title}</div>
      <ul>
        {inquiry.map((item, idx) => (
          <li key={idx} style={{ marginBottom: "1em", borderBottom: "1px solid #eee" }}>
            <div>送信者: {item.sender_name}</div>
            <div>内容: {item.content}</div>
            <div>作成日時: {formatDateTime(item.created_date)}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}