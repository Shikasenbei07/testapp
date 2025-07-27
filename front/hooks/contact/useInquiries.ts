import { useState } from "react";
import type { InquiryInfo } from "../../types/Contact";
import { getInquiries } from "../../lib/contactAPI";

export const useInquiries = () => {
  const [inquiries, setInquiries] = useState<InquiryInfo[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInquiries = async (params: { isSent: boolean; id: string }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getInquiries(params);
      setInquiries(result);
      return result;
    } catch (err: any) {
      setError(err.message || "エラーが発生しました");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    inquiries,
    loading,
    error,
    fetchInquiries,
  };
};
