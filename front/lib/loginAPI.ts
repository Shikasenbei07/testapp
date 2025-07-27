import type { LoginParams } from "../types/Login";

const API_URL_LOGIN = process.env.NEXT_PUBLIC_API_URL_LOGIN;

/**
 * ログイン処理
 *
 * @param id {string} - ユーザーID
 * @param password {string} - パスワード
 * @returns {Promise<{ id: string }>} - 成功時にユーザーIDを返す
 * @throws {Error} - HTTPステータスに応じたエラーメッセージ
 */
export async function login(params: LoginParams): Promise<{ id: string }> {
    const res = await fetch(API_URL_LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id: params.id,
            password: params.password,
        })
    });

    const data = await res.json();
    
    if (!res.ok) {
        throw new Error(data.error || "ログインに失敗しました");
    }
   
    return data as { id: string };
}