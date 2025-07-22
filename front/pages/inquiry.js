import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import InquiryForm from "../components/InquiryForm"; // 追加
import getEventDetail from "./api/getEventDetail";
import sendInquiry from "./api/sendInquiry";

export default function InquiryPage() {
  return (
    <InquiryForm
      eventId = {2}
    />
  );
}