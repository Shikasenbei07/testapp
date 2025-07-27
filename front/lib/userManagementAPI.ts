import type { User } from "../types/UserManagement";

const API_URL_GET_USER = process.env.NEXT_PUBLIC_API_URL_GET_USER;
const API_URL_UPDATE_USER = process.env.NEXT_PUBLIC_API_URL_UPDATE_USER;


/**
 * ユーザー情報の取得
 * 
 * @param id {string} - ユーザーID
 * @returns {Promise<User>} - 成功時にユーザー情報を返す
 * @throws {Error} - HTTPステータスに応じたエラーメッセージ
 */
export async function getUser(id: string): Promise<User> {
    const res = await fetch(API_URL_GET_USER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id })
    });

    const data = await res.json();
    
    if (!res.ok) {
        throw new Error(data.error || "ユーザー情報の取得に失敗しました");
    }

    const user: User = {
        id: data.id,
        email: data.email,
        secondEmail: data.second_email,
        tel: data.tel,
        lName: data.l_name,
        fName: data.f_name,
        lNameFuri: data.l_name_furi,
        fNameFuri: data.f_name_furi,
        birthday: data.birthday,
        profileImg: data.profile_img,
        handleName: data.handle_name,
    };
   
    return user;
}


/**
 * ユーザー情報の更新
 * 
 * @param id {string} - ユーザーID
 * @param userData {Partial<User>} - 更新するユーザー情報
 * @returns {Promise<{ message: string }>} - 成功時にメッセージを返す
 * @throws {Error} - HTTPステータスに応じたエラーメッセージ
 */
export async function updateUser(id: string, userData: Partial<User>): Promise<{ message: string }> {
    const res = await fetch(API_URL_UPDATE_USER, {
        method: "PATCH",
        headers: { "Content-Type": "multipart/form-data" },
        body: JSON.stringify({ id, ...userData })
    });

    const data = await res.json();
    
    if (!res.ok) {
        throw new Error(data.error || "ユーザー情報の更新に失敗しました");
    }
   
    return data;
}