import { useRouter } from "next/router";
import InquiryForm from "../../components/InquiryForm";

export default function InquiryPage() {
  const router = useRouter();
  const { event_id } = router.query;

  return <InquiryForm eventId={event_id} />;
}