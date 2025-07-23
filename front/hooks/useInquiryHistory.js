import { useEffect, useState } from "react";
import { getValidId } from "../utils/getValidId";

export function useInquiryHistory() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const userId = getValidId();

  useEffect(() => {
    async function fetchInquiries() {
      setLoading(true);
      try {
        const res = await fetch(
          "http://localhost:7071/api/get_inquiries",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: userId })
          }
        );
        const data = await res.json();
        if (!res.ok) throw new Error("error: " + data.error);

        setInquiries(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchInquiries();
  }, [userId]);

  return { inquiries, loading, error };
}