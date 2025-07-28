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
                    image: data.image,
                    max_participants: data.max_participants ? String(data.max_participants) : ""
                });
                // 画像URLの組み立て
                let imageUrl = null;
                if (data.image) {
                  if (/^https?:\/\//.test(data.image)) {
                    imageUrl = data.image;
                  } else {
                    // 画像ファイル名のみの場合はパスを組み立てる（例: /images/～ などプロジェクト仕様に合わせて修正）
                    imageUrl = `/images/${data.image}`;
                  }
                }
                setPreview(imageUrl);
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

    // 編集内容確認ページへ遷移
    const handleConfirmPage = (e) => {
        e.preventDefault();
        const v = validate(form);
        setErrors(v);
        if (Object.keys(v).length > 0) return;

        // is_draftを0にして送る
        const confirmForm = { ...form, is_draft: 0 };

        // 画像ファイルを選択している場合はlocalStorageに保存して遷移
        if (confirmForm.image instanceof File) {
            const reader = new FileReader();
            reader.onload = function (ev) {
                localStorage.setItem("eventEditImage", ev.target.result);
                localStorage.setItem("eventEditImageName", confirmForm.image.name);
                const params = new URLSearchParams({
                    event_id: confirmForm.event_id,
                    title: confirmForm.title,
                    date: confirmForm.date,
                    location: confirmForm.location,
                    category: confirmForm.category,
                    keywords: confirmForm.keywords.join(","),
                    summary: confirmForm.summary,
                    detail: confirmForm.detail,
                    deadline: confirmForm.deadline,
                    max_participants: confirmForm.max_participants,
                    imageName: confirmForm.image.name,
                    is_draft: 0
                }).toString();
                router.push(`/event/edit/confirm?${params}`);
            };
            reader.readAsDataURL(confirmForm.image);
        } else {
            // 画像未選択時は既存画像（プレビュー）をlocalStorageに保存して遷移
            if (preview) {
                localStorage.setItem("eventEditImage", preview);
                localStorage.setItem("eventEditImageName", "existing-image");
            } else {
                localStorage.removeItem("eventEditImage");
                localStorage.removeItem("eventEditImageName");
            }
            const params = new URLSearchParams({
                event_id: confirmForm.event_id,
                title: confirmForm.title,
                date: confirmForm.date,
                location: confirmForm.location,
                category: confirmForm.category,
                keywords: confirmForm.keywords.join(","),
                summary: confirmForm.summary,
                detail: confirmForm.detail,
                deadline: confirmForm.deadline,
                max_participants: confirmForm.max_participants,
                is_draft: 0
            }).toString();
            router.push(`/event/edit/confirm?${params}`);
        }
    };

    // 下書き保存処理
    const handleDraft = async (e) => {
        if (e) e.preventDefault();
        // is_draftを1にして送る
        const draftData = { ...form, is_draft: 1 };
        try {
            const formData = new FormData();
            Object.entries(draftData).forEach(([key, value]) => {
                if (key === "keywords" && Array.isArray(value)) {
                    value.forEach(k => formData.append("keywords", k));
                } else if (key === "image" && value instanceof File) {
                    formData.append("image", value, value.name);
                } else if (value !== undefined && value !== null) {
                    formData.append(key, value);
                }
            });
            const url = "https://0x0-eventmanagement-test.azurewebsites.net/api/events/%7Bevent_id%7D?code=tzUwLpPkrKEaGO5m9K5T1fSw21BkNQRyLNBmJ8QXHDk9AzFubRRUtg%3D%3D";
            //const url = process.env.NEXT_PUBLIC_API_URL_UPDATE_EVENT || "";
            await fetch(url.replace("%7Bevent_id%7D", form.event_id), {
                method: "PATCH",
                body: formData,
            });
            alert("下書き保存しました");
        } catch (err) {
            alert("下書き保存に失敗しました");
        }
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