import type { InquiryInfo, InquiryDetail, CreateInquiryParams, InquiryResponse } from "../types/Contact";

// const API_URL_GET_INQUIRIES = process.env.NEXT_PUBLIC_API_URL_GET_INQUIRIES;
// const API_URL_GET_INQUIRY_DETAILS = process.env.NEXT_PUBLIC_API_URL_GET_INQUIRY_DETAILS;
// const API_URL_CREATE_INQUIRY = process.env.NEXT_PUBLIC_API_URL_CREATE_INQUIRY;
// const API_URL_RECEIVE_INQUIRIES = process.env.NEXT_PUBLIC_API_URL_RECEIVE_INQUIRIES;
const API_URL_GET_INQUIRIES = "http://localhost:7071/api/get_inquiries";
const API_URL_GET_INQUIRY_DETAILS = "http://localhost:7071/api/get_inquiry_details";
const API_URL_CREATE_INQUIRY = "http://localhost:7071/api/create_inquiry";
const API_URL_RECEIVE_INQUIRIES = "http://localhost:7071/api/receive_inquiries";

/**
 * 問い合わせ履歴の取得
 *
 * @param params.isSent {boolean} - trueなら送信履歴、falseなら受信履歴を取得
 * @param params.id {string} - ユーザーID
 * @returns {Promise<InquiryInfo[]>} - 成功時
 * @throws {Error} - HTTPステータスに応じたエラーメッセージ
 */
export async function getInquiries(params: { isSent: boolean, id: string }): Promise<InquiryInfo[]> {
    const res = await fetch(API_URL_GET_INQUIRIES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            is_send: params.isSent,
            id: params.id
        })
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || "問い合わせ履歴の取得に失敗しました");
    }

    const inquiries: InquiryInfo[] = data.map((item: any) => ({
        inquiryId: item.inquiry_id,
        eventId: item.event_id,
        eventTitle: item.event_title,
        subject: item.subject,
        hashedInquiryId: item.hashed_inquiry_id,
        count: item.count,
    }));

    return inquiries;
}


/**
 * 問い合わせ詳細の取得
 *
 * @param params.id {string} - ユーザーID
 * @param params.hashedInquiryId {string} - ハッシュ化された問い合わせID
 * @returns {Promise<InquiryDetail[]>} - 成功時
 * @throws {Error} - HTTPステータスに応じたエラーメッセージ
 */
export async function getInquiryDetails(params: {id: string, hashedInquiryId: string}): Promise<InquiryDetail[]> {
    const res = await fetch(API_URL_GET_INQUIRY_DETAILS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id: params.id,
            hashed_inquiry_id: params.hashedInquiryId
        })
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || "問い合わせ詳細の取得に失敗しました");
    }

    const inquiryDetail: InquiryDetail[] = data.map((item: any) => ({
        inquiryId: item.inquiry_id,
        eventId: item.event_id,
        eventTitle: item.event_title,
        subject: item.subject,
        mainText: item.main_text,
        createdAt: item.created_at,
        recipient: item.recipient,
        recipientName: item.recipient_name,
        sender: item.sender,
        senderName: item.sender_name,
    }));

    return inquiryDetail;
}


/**
 * 問い合わせの作成
 * @param params {CreateInquiryParams} - 問い合わせ情報
 * @returns {Promise<{ message: string }>}>} - 成功時
 * @throws {Error} - HTTPステータスに応じたエラーメッセージ
 */
export async function createInquiry(params: CreateInquiryParams): Promise<{ message: string }> {
    const res = await fetch(API_URL_CREATE_INQUIRY, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            inquiry_id: params.inquiryId,
            event_id: params.eventId,
            subject: params.subject,
            main_text: params.mainText,
            recipient: params.recipient,
            sender: params.sender
        })
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || "問い合わせの作成に失敗しました");
    }

    return data as { message: string };
}


/**
 * 未読の問い合わせを受信
 * @param recipient {string} - 受信者のユーザID
 * @return {Promise<InquiryResponse[]>} - 成功時
 * @throws {Error} - HTTPステータスに応じたエラーメッセージ
 */
export async function receiveInquiries(recipient: string): Promise<InquiryResponse[]> {
    const res = await fetch(API_URL_RECEIVE_INQUIRIES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient })
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || "問い合わせの受信に失敗しました");
    }

    const inquiries: InquiryResponse[] = data.map((item: any) => ({
        inquiryId: item.inquiry_id,
        subject: item.subject,
        createdAt: item.created_at,
    }));

    return inquiries;
}