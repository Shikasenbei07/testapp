// components/InquiryDetailComponent.tsx
import { useEffect, useRef, useState } from "react";
import { formatDateTime } from "../utils/formatDateTime";
import { useInquiryDetails } from "../hooks/contact/useInquiryDetails";

const API_URL_GET_USER = process.env.NEXT_PUBLIC_API_URL_GET_USER;

type Props = {
  id: string;
  hashedInquiryId: string;
};

export const InquiryDetailComponent = ({ id, hashedInquiryId }: Props) => {
  const { inquiryDetail, loading, error } = useInquiryDetails({ id, hashedInquiryId });
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [partnerIcon, setPartnerIcon] = useState<string | null>(null);

  useEffect(() => {
    if (!inquiryDetail || !id) return;

    const idx = inquiryDetail.findIndex((item) => item.sender !== id);
    const sender = idx !== -1 ? inquiryDetail[idx].sender : null;

    if (sender) {
      fetch(API_URL_GET_USER!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: sender }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.profile_img) setPartnerIcon(data.profile_img);
        });
    }
  }, [inquiryDetail, id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [inquiryDetail]);

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!inquiryDetail || inquiryDetail.length === 0) return <div>データがありません。</div>;
  if (inquiryDetail[0].recipient !== id && inquiryDetail[0].sender !== id) return <div>権限がありません。</div>;

  return (
    <div>
      <h2>問い合わせ詳細</h2>
      {inquiryDetail[0].eventTitle ? (
        <div>イベント名: {inquiryDetail[0].eventTitle}</div>
      ) : (
        <div style={{ color: "red" }}>削除されたイベント</div>
      )}
      {inquiryDetail[0].eventTitle && (
        <div>イベント作成者: {inquiryDetail[0].recipientName}</div>
      )}
      <div>件名: {inquiryDetail[0].subject}</div>

      <div>
        {inquiryDetail.map((item, idx) => (
          <div
            key={idx}
            className={`inquiry-message-box ${item.sender === id ? "right" : "left"}`}
          >
            {item.sender !== id && (
              <div className="sender-name">
                {partnerIcon && (
                  <img
                    src={partnerIcon}
                    alt="partner icon"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      marginRight: 8,
                      verticalAlign: "middle",
                    }}
                  />
                )}
                {item.senderName}
              </div>
            )}
            <div className="balloon-content">{item.mainText}</div>
            <div className="created-date">{formatDateTime(item.createdAt)}</div>
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>

      <style jsx>{`
        .inquiry-message-box {
          border: 1px solid #e0e0e0;
          border-radius: 16px;
          padding: 16px 20px;
          margin-bottom: 1.5em;
          background: #fafaff;
          max-width: 70%;
          clear: both;
        }
        .inquiry-message-box.left {
          margin-right: auto;
          text-align: left;
        }
        .inquiry-message-box.right {
          margin-left: auto;
          text-align: right;
        }
        .sender-name {
          font-weight: bold;
          margin-bottom: 6px;
        }
        .balloon-content {
          background: #f3f0ff;
          border-radius: 16px;
          padding: 16px 20px;
          display: inline-block;
          position: relative;
          max-width: 100%;
          word-break: break-word;
        }
        .created-date {
          font-size: 0.85em;
          color: #888;
          margin-top: 6px;
        }
      `}</style>
    </div>
  );
};
