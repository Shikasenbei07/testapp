// pages/mypage/inquiries/[inquiry_id].tsx
import { useRouter } from "next/router";
import { InquiryDetailComponent } from "../../../components/InquiryDetailComponent";
import { MessageInputForm } from "../../../components/MessageInputForm";

export default function InquiryPage() {
  const router = useRouter();
  const hashedInquiryId = router.query.inquiry_id as string;

  const userId = typeof window !== "undefined" ? localStorage.getItem("id") : null;

  if (!userId || !hashedInquiryId) return <div>読み込み中...</div>;

  return (
    <>
      <InquiryDetailComponent id={userId} hashedInquiryId={hashedInquiryId} />
      <MessageInputForm
        id={userId}
        hashedInquiryId={hashedInquiryId}
        sender={userId}
      />
    </>
  );
}
