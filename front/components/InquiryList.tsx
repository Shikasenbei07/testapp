import React from 'react';
import Link from 'next/link';
import type { InquiryInfo } from "../types/Contact";

type Props = {
  inquiries: InquiryInfo[];
};

export const InquiryList: React.FC<Props> = ({ inquiries }) => {
  return (
    <div>
      <ul>
        {inquiries.map((item) => (
          <li key={item.inquiryId}>
            <Link href={`/inquiry/chat/${item.hashedInquiryId}`}>
              {item.subject}（{item.eventTitle}） - {item.count}件
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};