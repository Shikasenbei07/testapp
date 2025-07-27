import { getValidId } from '../../utils/getValidId';
import { useEffect, useState } from 'react';
import { InquiryList } from '../../components/InquiryList';
import { getInquiries } from '../../lib/contactAPI';
import type { InquiryInfo } from "../../types/Contact";

export default function SentInquiriesPage() {
  const id = getValidId();
  const [inquiries, setInquiries] = useState<InquiryInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getInquiries({ isSent: true, id: id });
        setInquiries(data);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchData();
  }, []);

  if (error) return <p>エラー: {error}</p>;

  return (
    <div>
      <h1>送信済み問い合わせ一覧</h1>
      <InquiryList inquiries={inquiries} />
    </div>
  );
}
