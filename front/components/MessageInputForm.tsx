// components/MessageInputForm.tsx
import { useState, useRef } from "react";
import { useInquiryDetails } from "../hooks/contact/useInquiryDetails";
import { useCreateInquiry } from "../hooks/contact/useCreateInquiry";

type Props = {
  id: string;
  hashedInquiryId: string;
  sender: string;
};

export const MessageInputForm = ({ id, hashedInquiryId, sender }: Props) => {
  const [mainText, setMainText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const { inquiryDetail } = useInquiryDetails({ id, hashedInquiryId });
  const { submitInquiry, loading, error } = useCreateInquiry();

  const inquiryId = inquiryDetail?.[0]?.inquiryId ?? null;

  let recipient;
  if (inquiryDetail && inquiryDetail.length > 0) {
    recipient = inquiryDetail[0].recipient;
    for (let i = 0; i < inquiryDetail.length; i++) {
      if (inquiryDetail[i].sender !== id) {
        recipient = inquiryDetail[i].sender;
        break;
      }
    }
  } else {
    recipient = null;
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainText.trim() || loading || !inquiryId || !recipient) return;

    await submitInquiry({
      inquiryId: inquiryId,
      eventId: null,
      subject: null,
      sender: sender,
      recipient: recipient,
      mainText: mainText.trim(),
    });

    setMainText("");
    inputRef.current?.focus();
  };

  return (
    <form className="inquiry-form" onSubmit={handleSend}>
      <textarea
        ref={inputRef}
        className="inquiry-textarea"
        value={mainText}
        onChange={(e) => setMainText(e.target.value)}
        placeholder="メッセージを入力"
        rows={3}
        disabled={loading}
      />
      <button
        className="inquiry-send-btn"
        type="submit"
        disabled={loading || !mainText.trim()}
      >
        送信
      </button>
      {error && <div style={{ color: "red" }}>{error}</div>}

      <style jsx>{`
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
    </form>
  );
};
