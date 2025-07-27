import { useState } from "react";
import { createInquiry } from "../../lib/contactAPI";
import type { CreateInquiryParams } from "../../types/Contact";

export const useCreateInquiry = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const submitInquiry = async (params: CreateInquiryParams) => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await createInquiry(params);
      setMessage(res.message);
    } catch (err: any) {
      setError(err.message || "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return {
    message,
    loading,
    error,
    submitInquiry,
  };
};
