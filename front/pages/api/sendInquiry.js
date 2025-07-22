//const API_URL_CREATE_INQUIRY = process.env.NEXT_PUBLIC_API_URL_CREATE_INQUIRY;
const API_URL_CREATE_INQUIRY = "http://localhost:7071/api/create_inquiry";

export default async function sendInquiry(inquiryId=null, event_id, title, content, destination, sender) {
  try {
    console.log('Sending inquiry...');
    const res = await fetch(API_URL_CREATE_INQUIRY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inquiryId,
        event_id,
        title,
        content,
        destination,
        sender
      })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}, body: ${data.error}`);
    }
    return data;
  } catch (e) {
    console.error('sendInquiry error:', e);
    throw e;
  }
}