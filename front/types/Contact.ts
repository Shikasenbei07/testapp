export type InquiryInfo = {
    inquiryId: number;
    eventId: number;
    eventTitle: string;
    subject: string;
    hashedInquiryId: string;
    count: number;
}

export type InquiryDetail = {
    inquiryId: number;
    eventId: number;
    eventTitle: string;
    subject: string;
    mainText: string;
    createdAt: string;
    recipient: string;
    recipientName: string;
    sender: string;
    senderName: string;
};

export type CreateInquiryParams = {
  inquiryId: number | null;
  eventId: number | null;
  subject: string | null;
  mainText: string;
  recipient: string;
  sender: string;
};

export type InquiryResponse = {
    inquiryId: number;
    subject: string;
    createdAt: string;
};