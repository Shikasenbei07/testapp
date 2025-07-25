import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { formatDateTime } from "../../utils/formatDateTime";

const API_URL_GET_INQUIRY_DETAILS = process.env.NEXT_PUBLIC_API_URL_GET_INQUIRY_DETAILS;
const API_URL_GET_USER = process.env.NEXT_PUBLIC_API_URL_GET_USER;
const API_URL_CREATE_INQUIRY = process.env.NEXT_PUBLIC_API_URL_CREATE_INQUIRY;

export default function InquiryDetail() {
  const [inquiry, setInquiry] = useState(null);
  const [partnerIcon, setPartnerIcon] = useState(null);
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const router = useRouter();
  const inputRef = useRef(null);

  // クエリパラメータ取得
  const [hashedInquiryId, setHashedInquiryId] = useState(null);

  useEffect(() => {
    if (!router.isReady) return;
    const id = router.asPath.split("/").pop();
    setHashedInquiryId(id);
  }, [router.isReady, router.asPath]);

  useEffect(() => {
    if (!hashedInquiryId) return;
    async function fetchInquiry() {
      const res = await fetch(API_URL_GET_INQUIRY_DETAILS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hashed_inquiry_id: hashedInquiryId }),
      });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setInquiry(data);
      }
    }
    fetchInquiry();
  }, [hashedInquiryId]);

  const userId = typeof window !== "undefined" ? localStorage.getItem("id") : null;

  // partner_icon取得処理
  useEffect(() => {
    if (!inquiry) return;
    const idx = inquiry.findIndex(item => item.sender !== userId);
    if (idx !== -1) {
      const sender = inquiry[idx].sender;
      if (sender) {
        fetch(API_URL_GET_USER, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: sender }),
        })
          .then(res => res.json())
          .then(data => {
            if (data && data.profile_img) {
              let imgUrl = data.profile_img;
              setPartnerIcon(imgUrl);
            }
          });
      }
    }
  }, [inquiry, userId]);

  if (!inquiry || inquiry.length === 0 || (inquiry[0].destination != userId && inquiry[0].sender != userId)) {
    return <div>データがありません。</div>;
  }

  // 返信先のidxを取得
  const idx = inquiry.findIndex(item => item.sender !== userId);
  // 返信先のユーザーID
  const replyTo = (idx !== -1 && inquiry[idx].sender) ? inquiry[idx].sender : inquiry[0].destination;

  // 送信処理
  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim() || isSending) return;
    setIsSending(true);

    const newMessage = {
      inquiry_id: inquiry[0].inquiry_id,
      sender: userId,
      destination: replyTo,
      content: content.trim(),
    };

    // 画面に即時反映
    setInquiry([
      ...inquiry,
      {
        ...newMessage,
        created_date: new Date().toISOString(),
      }
    ]);

    setContent("");
    if (inputRef.current) inputRef.current.focus();

    // サーバーへ送信
    try {
      await fetch(API_URL_CREATE_INQUIRY, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMessage),
      });
    } catch (e) {
      // エラー時は何もしない（必要ならエラー表示を追加）
    }
    setIsSending(false);
  };

  return (
    <div>
      <h2>問い合わせ詳細</h2>
      {inquiry[0].event_title
        ? <div>イベント名: {inquiry[0].event_title}</div>
        : <div style={{ color: "red" }}>削除されたイベント</div>
      }
      {inquiry[0].event_title && (
        <div>イベント作成者: {inquiry[0].destination_name}</div>
      )}
      <div>件名: {inquiry[0].inquiry_title}</div>
      <div>
        {inquiry.map((item, idx) => (
          <div
            key={idx}
            className={`inquiry-message-box ${item.sender === userId ? "right" : "left"}`}
          >
            {item.sender === userId ? (
              <div className="sender-name">{item.sender_name}</div>
            ) : (
              <div className="sender-name">
                {partnerIcon && (
                  <img
                    src={partnerIcon}
                    alt="partner icon"
                    style={{ width: 28, height: 28, borderRadius: "50%", marginRight: 8, verticalAlign: "middle" }}
                  />
                )}
                {item.sender_name}
              </div>
            )}
            <div className="balloon-content">{item.content}</div>
            <div className="created-date">{formatDateTime(item.created_date)}</div>
          </div>
        ))}
      </div>
      <form className="inquiry-form" onSubmit={handleSend}>
        <textarea
          ref={inputRef}
          className="inquiry-textarea"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="メッセージを入力"
          rows={3}
          disabled={isSending}
        />
        <button
          className="inquiry-send-btn"
          type="submit"
          disabled={isSending || !content.trim()}
        >
          送信
        </button>
      </form>
      <button
        className="back-inquiry-btn"
        onClick={() => router.push("/mypage/inquiries")}
      >
        問い合わせ履歴に戻る
      </button>
      <style jsx>{`
        .back-inquiry-btn {
          margin-top: 2em;
          padding: 8px 16px;
          background: #7f5af0;
          color: #fff;
          border: none;
          border-radius: 6px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
        }
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
          margin-left: 0;
          text-align: left;
        }
        .inquiry-message-box.right {
          margin-left: auto;
          margin-right: 0;
          text-align: right;
        }
        .sender-name {
          font-weight: bold;
          margin-bottom: 6px;
        }
        .balloon-content {
          display: inline-block;
          position: relative;
          background: #f3f0ff;
          color: #222;
          border-radius: 16px;
          padding: 16px 20px;
          margin-bottom: 8px;
          max-width: 100%;
          font-size: 1rem;
          word-break: break-word;
        }
        .inquiry-message-box.left .balloon-content:before {
          content: "";
          position: absolute;
          left: 20px;
          top: 100%;
          width: 0;
          height: 0;
          border: 10px solid transparent;
          border-top: 10px solid #f3f0ff;
        }
        .inquiry-message-box.right .balloon-content:before {
          content: "";
          position: absolute;
          right: 20px;
          top: 100%;
          width: 0;
          height: 0;
          border: 10px solid transparent;
          border-top: 10px solid #f3f0ff;
        }
        .created-date {
          font-size: 0.85em;
          color: #888;
          margin-top: 6px;
        }
        .inquiry-form {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          background: #fff;
          border-top: 1px solid #e0e0e0;
          padding: 1em;
          display: flex;
          gap: 1em;
          z-index: 100;
        }
        .inquiry-textarea {
          flex: 1;
          resize: none;
          border-radius: 8px;
          border: 1px solid #ccc;
          padding: 8px;
          font-size: 1rem;
        }
        .inquiry-send-btn {
          background: #7f5af0;
          color: #fff;
          border: none;
          border-radius: 6px;
          font-weight: 700;
          font-size: 1rem;
          padding: 0 1.5em;
          cursor: pointer;
        }
        .inquiry-send-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}