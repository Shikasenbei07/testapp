import { ReservationInfo, ParticipationInfo } from "../types/Participation";

const IS_LOCAL = process.env.NEXT_PUBLIC_IS_LOCAL === "true";
const API_URL_PARTICIPATE = process.env.NEXT_PUBLIC_API_URL_PARTICIPATE;
const API_URL_RESERVATION_HISTORY = process.env.NEXT_PUBLIC_API_URL_RESERVATION_HISTORY;
const API_URL_CANCEL_PARTICIPATION = process.env.NEXT_PUBLIC_API_URL_CANCEL_PARTICIPATION;
const API_URL_PARTICIPATION_HISTORY = process.env.NEXT_PUBLIC_API_URL_PARTICIPATION_HISTORY;
const API_URL_GET_PARTICIPANTS = process.env.NEXT_PUBLIC_API_URL_GET_PARTICIPANTS;


export async function participate(params: { eventId: number, id: string }): Promise<{ message: string }> {
    const res = await fetch(API_URL_PARTICIPATE, {
        method: "POST",
        headers: { "Content-Type": "application/json", },
        body: JSON.stringify({
            event_id: params.eventId,
            id: params.id
        }),
    });

    const data = await res.json();
    
    if (!res.ok) {
        throw new Error(data.error || "参加に失敗しました");
    }

    return { message: data.message || "参加が完了しました" };
}


export async function reservationHistory(id: string): Promise<ReservationInfo[]> {
    const res = await fetch(API_URL_RESERVATION_HISTORY, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || "予約履歴の取得に失敗しました");
    }

    const reservation: ReservationInfo[] = data.map((item: any) => ({
        eventId: item.event_id,
        eventTitle: item.event_title,
        eventDateTime: item.event_date_time,
        registeredAt: item.registered_at,
        location: item.location,
        image: item.image,
    }));

    return reservation;
}


export async function cancelParticipation(params: {eventId: number, userId: string}): Promise<{ message: string }> {
    const res = await fetch(API_URL_CANCEL_PARTICIPATION, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            event_id: params.eventId,
            id: params.userId 
        }),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || "キャンセルに失敗しました");
    }

    return { message: data.message || "キャンセルが完了しました" };
}


export async function participationHistory(id: string): Promise<ReservationInfo[]> {
    const res = await fetch(API_URL_PARTICIPATION_HISTORY, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || "参加履歴の取得に失敗しました");
    }

    const participation: ReservationInfo[] = data.map((item: any) => ({
        eventId: item.event_id,
        eventTitle: item.event_title,
        eventDateTime: item.event_date_time,
        registeredAt: item.registered_at,
        location: item.location,
        image: item.image,
    }));

    return participation;
}


export async function getParticipants(eventId: number): Promise<ParticipationInfo[]> {
    let url;
    if(IS_LOCAL) {
        url = API_URL_GET_PARTICIPANTS + `?event_id=${eventId}`;
    } else {
        url = API_URL_GET_PARTICIPANTS + `&event_id=${eventId}`;
    }
    const res = await fetch(url);

    const data = await res.json();
    
    if (!res.ok) {
        throw new Error(data.error || "ログインに失敗しました");
    }

    const participants: ParticipationInfo[] = data.map((item: any) => ({
        id: item.id,
        profileImg: item.profile_img,
        handleName: item.handle_name,
    }));
   
    return participants;
}