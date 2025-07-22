const isLocal = process.env.NEXT_PUBLIC_IS_LOCAL === "true";
const API_URL_GET_EVENT_DETAIL = process.env.NEXT_PUBLIC_API_URL_GET_EVENT_DETAIL;

export default async function getEventDetail(eventId) {
  try {
    const url = isLocal
      ? `${API_URL_GET_EVENT_DETAIL}?event_id=${eventId}`
      : `${API_URL_GET_EVENT_DETAIL}&event_id=${eventId}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}, body: ${data.error}`);
    }
    return data;
  } catch (e) {
    console.error('getEventDetail error:', e);
    throw e;
  }
}