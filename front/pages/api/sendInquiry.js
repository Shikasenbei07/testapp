//const API_URL_CREATE_INQUIRY = process.env.NEXT_PUBLIC_API_URL_CREATE_INQUIRY;
const API_URL_CREATE_INQUIRY = "http://localhost:7071/api/create_inquiry";

export default async function sendInquiry(inquiry_id=null, event_id, title, content, destination, sender) {
  try {
    console.log('Sending inquiry...');
    const res = await fetch(API_URL_CREATE_INQUIRY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inquiry_id,
        event_id,
        title,
        content,
        destination,
        sender
      })
    });
    console.log('Inquiry response status:', res.status);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const text = await res.text();
    console.log('Inquiry response:', text);
    return text;
  } catch (error) {
    console.error('sendInquiry error:', error);
    throw error;
  }
}