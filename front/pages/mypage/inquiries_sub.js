import { useInquiryHistory } from "../../hooks/useInquiryHistory";
import InquiryHistoryList from "../../components/InquiryHistoryList";

export default function InquiryHistory() {
  const { inquiries, loading, error } = useInquiryHistory();

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error}</div>;

  return <InquiryHistoryList inquiries={inquiries} />;
}