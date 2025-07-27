import { useState, useEffect } from "react";
import type { InquiryDetail } from "../../types/Contact";
import { getInquiryDetails } from "../../lib/contactAPI";

export const useInquiryDetails = (params: { id: string; hashedInquiryId: string }) => {
  const [inquiryDetail, setInquiryDetail] = useState<InquiryDetail[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id || !params.hashedInquiryId) return;

    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const inquiryDetails = await getInquiryDetails(params);
        setInquiryDetail(inquiryDetails);
      } catch (err: any) {
        setError(err.message || "問い合わせ詳細の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [params.id, params.hashedInquiryId]);

  return {
    inquiryDetail,
    loading,
    error,
  };
};
