import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { getValidId } from "../utils/getValidId";

const API_URL_UPDATE_EVENT = process.env.NEXT_PUBLIC_API_URL_UPDATE_EVENT;

export function useEventEditConfirm() {
    const router = useRouter();
    const [formValues, setFormValues] = useState(null);
    const [categoryName, setCategoryName] = useState("");
    const [keywordNames, setKeywordNames] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!router.isReady) return;
        const {
            event_id = "",
            title = "",
            date = "",
            location = "",
            category = "",
            keywords: rawKeywords = [],
            summary = "",
            detail = "",
            deadline = "",
            max_participants = ""
        } = router.query;
        const keywords = typeof rawKeywords === "string" ? rawKeywords.split(",") : rawKeywords;
        setFormValues({ event_id, title, date, location, category, keywords, summary, detail, deadline, max_participants });
        try {
            const categoriesMaster = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("categories") || "[]") : [];
            const keywordsMaster = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("keywords") || "[]") : [];
            const foundCategory = categoriesMaster.find(c => String(c.value) === String(category));
            if (foundCategory) setCategoryName(foundCategory.label);
            setKeywordNames(keywords.map(k => {
                const found = keywordsMaster.find(kw => String(kw.value) === String(k));
                return found ? found.label : k;
            }));
        } catch { }
    }, [router.isReady, router.query]);

    const handleConfirm = async () => {
        setLoading(true);
        setError("");
        const url = API_URL_UPDATE_EVENT.replace("%7Bevent_id%7D", formValues.event_id);

        // JSONで送信する場合
        const body = JSON.stringify({
            title: formValues.title,
            date: formValues.date,
            location: formValues.location,
            category: formValues.category,
            summary: formValues.summary,
            detail: formValues.detail,
            deadline: formValues.deadline,
            max_participants: formValues.max_participants,
            keywords: formValues.keywords,
            creator: getValidId && getValidId()
        });

        try {
            const res = await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body
            });
            if (res.ok) {
                router.push("/event/edit/complete");
            } else {
                let err;
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    err = await res.json();
                } else {
                    err = { error: await res.text() };
                }
                setError("更新失敗: " + (err.error || res.status) + (err.trace ? "\n" + err.trace : ""));
            }
        } catch (err) {
            setError("通信エラー: " + err);
        }
        setLoading(false);
    };

    const handleBack = () => {
        router.back();
    };

    return {
        formValues,
        categoryName,
        keywordNames,
        loading,
        error,
        handleConfirm,
        handleBack
    };
}