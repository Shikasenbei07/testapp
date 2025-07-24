import { useState, useEffect } from "react";
import { useRouter } from "next/router";

const API_URL_GET_CATEGORIES = process.env.NEXT_PUBLIC_API_URL_GET_CATEGORIES;
const API_URL_GET_KEYWORDS = process.env.NEXT_PUBLIC_API_URL_GET_KEYWORDS;
const API_URL_GET_EVENT_DETAIL = process.env.NEXT_PUBLIC_API_URL_GET_EVENT_DETAIL;

export function useEventEditForm() {
    const router = useRouter();
    const [form, setForm] = useState({
        event_id: "",
        title: "",
        date: "",
        location: "",
        category: "",
        keywords: [],
        summary: "",
        detail: "",
        deadline: "",
        image: null,
        max_participants: ""
    });
    const [errors, setErrors] = useState({});
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [keywordOptions, setKeywordOptions] = useState([]);

    useEffect(() => {
        fetch(API_URL_GET_CATEGORIES)
            .then(res => res.json())
            .then(json => setCategoryOptions(json.map(c => ({ value: String(c.category_id), label: c.category_name }))));
        fetch(API_URL_GET_KEYWORDS)
            .then(res => res.json())
            .then(json => setKeywordOptions(json.map(k => ({ value: String(k.keyword_id), label: k.keyword_name }))));
    }, []);

    useEffect(() => {
        const eventId = router.query.event_id || (typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("event_id") : "");
        if (!eventId) return;
        setLoading(true);
        fetch(API_URL_GET_EVENT_DETAIL + `&event_id=${eventId}`)
            .then(async res => {
                if (!res.ok) {
                    const contentType = res.headers.get("content-type");
                    let err;
                    if (contentType && contentType.includes("application/json")) {
                        err = await res.json();
                    } else {
                        err = { error: await res.text() };
                    }
                    setErrors({ fetch: err.error || `取得失敗: ${res.status}` });
                    setForm(prev => ({ ...prev, event_id: eventId }));
                    setPreview(null);
                    return null;
                }
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    try {
                        if (res.headers.get('content-length') === '0') {
                            setErrors({ fetch: "データが空です" });
                            return null;
                        }
                        return await res.json();
                    } catch {
                        setErrors({ fetch: "データ取得時にJSON解析エラー" });
                        return null;
                    }
                } else {
                    setErrors({ fetch: "データ取得時に不正なレスポンス" });
                    return null;
                }
            })
            .then(data => {
                if (!data) return;
                // 取得したキーワードID配列（オブジェクト配列・ID配列どちらでも対応）
                let checkedKeywords = [];
                if (Array.isArray(data.keywords)) {
                    if (typeof data.keywords[0] === "object" && data.keywords[0] !== null) {
                        checkedKeywords = data.keywords.map(k => String(k.keyword_id));
                    } else {
                        checkedKeywords = data.keywords.map(k => String(k));
                    }
                }
                setForm({
                    event_id: data.event_id,
                    title: data.event_title,
                    date: data.event_datetime,
                    location: data.location,
                    category: String(data.event_category),
                    keywords: checkedKeywords,
                    summary: data.description,
                    detail: data.content,
                    deadline: data.deadline,
                    image: null,
                    max_participants: data.max_participants ? String(data.max_participants) : ""
                });
                setPreview(data.image ? `/images/${data.image}` : null);
            })
            .finally(() => setLoading(false));
    }, [router.query.event_id]);

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        if (name === "keywords") {
            setForm((prev) => {
                const newKeywords = checked
                    ? [...prev.keywords, value]
                    : prev.keywords.filter((k) => k !== value);
                return { ...prev, keywords: newKeywords };
            });
        } else if (name === "image") {
            const file = files[0];
            setForm((prev) => ({ ...prev, image: file }));
            if (file) {
                setPreview(URL.createObjectURL(file));
                // 画像ファイルをDataURL化してlocalStorageに保存
                const reader = new FileReader();
                reader.onload = function (ev) {
                    localStorage.setItem("eventEditImage", ev.target.result);
                    localStorage.setItem("eventEditImageName", file.name);
                };
                reader.readAsDataURL(file);
            } else {
                setPreview(null);
                localStorage.removeItem("eventEditImage");
                localStorage.removeItem("eventEditImageName");
            }
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const validate = (data) => {
        const newErrors = {};
        if (!data.title || data.title.length > 255) newErrors.title = "255文字以内で入力してください";
        if (!data.location || data.location.length > 255) newErrors.location = "255文字以内で入力してください";
        if (!data.summary || data.summary.length > 200) newErrors.summary = "200文字以内で入力してください";
        if (!data.detail || data.detail.length > 200) newErrors.detail = "200文字以内で入力してください";
        if (!data.category || !categoryOptions.some(c => c.value === data.category)) newErrors.category = "カテゴリを選択してください";
        if (!data.keywords.length) newErrors.keywords = "1つ以上選択してください";
        return newErrors;
    };

    const handleConfirmPage = (e) => {
        e.preventDefault();
        const v = validate(form);
        setErrors(v);
        if (Object.keys(v).length > 0) return;
        const params = new URLSearchParams({
            event_id: form.event_id,
            title: form.title,
            date: form.date,
            location: form.location,
            category: form.category,
            keywords: form.keywords.join(","),
            summary: form.summary,
            detail: form.detail,
            deadline: form.deadline,
            max_participants: form.max_participants
        }).toString();
        router.push(`/event/edit/confirm?${params}`);
    };

    const isFormComplete = () => {
        return (
            form.title &&
            form.date &&
            form.location &&
            form.category &&
            form.keywords.length > 0 &&
            form.summary &&
            form.detail &&
            form.deadline
        );
    };

    const handleDeleteConfirmPage = () => {
        router.push(`/event/delete/confirm?id=${form.event_id}`);
    };

    const handleDraft = () => { };

    return {
        form,
        setForm,
        errors,
        setErrors,
        preview,
        loading,
        categoryOptions,
        keywordOptions,
        handleChange,
        handleConfirmPage,
        handleDraft,
        handleDeleteConfirmPage,
        isFormComplete
    };
}