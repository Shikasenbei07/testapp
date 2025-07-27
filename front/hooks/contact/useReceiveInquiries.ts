import { useState, useEffect } from "react";
import { receiveInquiries } from "../../lib/contactAPI";
import type { InquiryResponse } from "../../types/Contact";

export const useReceiveInquiries = (recipient: string) => {
  const [inquiries, setInquiries] = useState<InquiryResponse[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!recipient) return;

    const fetchInquiries = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await receiveInquiries(recipient);
        setInquiries(data);
      } catch (err: any) {
        setError(err.message || "問い合わせの受信に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, [recipient]);

  return {
    inquiries,
    loading,
    error,
  };
};
