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
            max_participants = "",
            imageName = null
        } = router.query;
        const keywords = typeof rawKeywords === "string" ? rawKeywords.split(",") : rawKeywords;

        // 画像データの復元
        let image = imageName;
        try {
            const imageData = typeof window !== "undefined" ? localStorage.getItem("eventEditImage") : null;
            const imageNameData = typeof window !== "undefined" ? localStorage.getItem("eventEditImageName") : null;
            if (imageData && imageNameData) {
                const arr = imageData.split(",");
                if (arr[0].includes("base64")) {
                    const mime = arr[0].match(/:(.*?);/)[1];
                    const bstr = atob(arr[1]);
                    let n = bstr.length;
                    const u8arr = new Uint8Array(n);
                    while (n--) {
                        u8arr[n] = bstr.charCodeAt(n);
                    }
                    image = new File([u8arr], imageNameData, { type: mime });
                }
            }
        } catch { /* 画像復元失敗時は何もしない */ }

        setFormValues({ event_id, title, date, location, category, keywords, summary, detail, deadline, max_participants, image });

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

        const formData = new FormData();
        formData.append("title", formValues.title);
        formData.append("date", formValues.date);
        formData.append("location", formValues.location);
        formData.append("category", formValues.category);
        formData.append("summary", formValues.summary);
        formData.append("detail", formValues.detail);
        formData.append("deadline", formValues.deadline);
        formData.append("max_participants", formValues.max_participants);
        formValues.keywords && formValues.keywords.forEach(k => formData.append("keywords", k));
        formData.append("creator", getValidId && getValidId());
        // 画像ファイルがあれば追加
        if (formValues.image instanceof File) {
            formData.append("image", formValues.image, formValues.image.name);
        }

        try {
            const res = await fetch(url, {
                method: "PUT",
                body: formData
            });
            if (res.ok) {
                // 編集完了時にlocalStorageから画像データを削除
                localStorage.removeItem("eventEditImage");
                localStorage.removeItem("eventEditImageName");
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