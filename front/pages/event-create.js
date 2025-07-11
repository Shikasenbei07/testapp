
import { useState, useEffect } from "react";

// カテゴリ・キーワードをlocalStorageでキャッシュするカスタムフック
function useCachedFetch(key, url, mapFn) {
    const [data, setData] = useState([]);
    useEffect(() => {
        const cached = localStorage.getItem(key);
        if (cached) {
            setData(JSON.parse(cached));
            return;
        }
        fetch(url)
            .then(res => res.json())
            .then(json => {
                const mapped = mapFn ? json.map(mapFn) : json;
                setData(mapped);
                localStorage.setItem(key, JSON.stringify(mapped));
            });
    }, [key, url, mapFn]);
    return data;
}


export default function EventCreate() {
    const [preview, setPreview] = useState(null);
    const [form, setForm] = useState({
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

    // カテゴリ・キーワードをlocalStorageでキャッシュ
    // APIベースURLを環境変数から取得（なければlocalhost）
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:7071";
    const categoryOptions = useCachedFetch(
        "categories",
        `${API_BASE_URL}/api/categories`,
        c => ({ value: String(c.category_id), label: c.category_name })
    );
    const keywordOptions = useCachedFetch(
        "keywords",
        `${API_BASE_URL}/api/keywords`,
        k => ({ value: String(k.keyword_id), label: k.keyword_name })
    );

    // バリデーション
    const validate = (data) => {
        const newErrors = {};
        const now = new Date();
        const eventDate = data.date ? new Date(data.date) : null;
        const deadlineDate = data.deadline ? new Date(data.deadline) : null;
        if (!data.title || data.title.length > 255) newErrors.title = "255文字以内で入力してください";
        if (!data.location || data.location.length > 255) newErrors.location = "255文字以内で入力してください";
        if (!data.summary || data.summary.length > 200) newErrors.summary = "200文字以内で入力してください";
        if (!data.detail || data.detail.length > 200) newErrors.detail = "200文字以内で入力してください";
        if (!data.category || !categoryOptions.some(c => c.value === data.category)) newErrors.category = "カテゴリを選択してください";
        if (!data.keywords.length) newErrors.keywords = "1つ以上選択してください";
        if (
            data.max_participants &&
            (
                !/^[0-9]+$/.test(data.max_participants) ||
                parseInt(data.max_participants) < 1 ||
                parseInt(data.max_participants) > 1000
            )
        ) {
            newErrors.max_participants = "1以上1000以下の整数で入力してください";
        }
        if (!data.date) {
            newErrors.date = "日付を入力してください";
        } else if (eventDate <= now) {
            newErrors.date = "日付は現在日時より後を指定してください";
        }
        if (!data.deadline) {
            newErrors.deadline = "締切日を入力してください";
        } else if (deadlineDate <= now) {
            newErrors.deadline = "締切日は現在日時より後を指定してください";
        } else if (eventDate && deadlineDate && (deadlineDate >= eventDate)) {
            newErrors.deadline = "締切日はイベント日付より前にしてください";
        }
        if (data.image && data.image.name && data.image.name.length > 200) newErrors.image = "画像ファイル名は200文字以内";
        return newErrors;
    };

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
            } else {
                setPreview(null);
            }
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };


    // 全項目入力済みかどうか判定
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const v = validate(form);
        setErrors(v);
        if (Object.keys(v).length > 0) return;

        const formData = new FormData();
        formData.append("title", form.title);
        formData.append("date", form.date);
        formData.append("location", form.location);
        formData.append("category", form.category);
        formData.append("summary", form.summary);
        formData.append("detail", form.detail);
        formData.append("deadline", form.deadline);
        formData.append("max_participants", form.max_participants);
        formData.append("is_draft", 0);
        if (form.image) formData.append("image", form.image);
        form.keywords.forEach(k => formData.append("keywords", k));

        try {
            const res = await fetch(`${API_BASE_URL}/api/events`, {
                method: "POST",
                body: formData
            });
            if (res.ok) {
                alert("イベントを登録しました");
            } else {
                let err;
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    err = await res.json();
                } else {
                    err = { error: await res.text() };
                }
                alert("登録失敗: " + (err.error || res.status) + (err.trace ? "\n" + err.trace : ""));
            }
        } catch (err) {
            alert("通信エラー: " + err);
        }
    };

    // 下書き保存（バリデーションなし）
    const handleDraft = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("title", form.title);
        formData.append("date", form.date);
        formData.append("location", form.location);
        formData.append("category", form.category);
        formData.append("summary", form.summary);
        formData.append("detail", form.detail);
        formData.append("deadline", form.deadline);
        formData.append("max_participants", form.max_participants);
        formData.append("is_draft", 1);
        if (form.image) formData.append("image", form.image);
        form.keywords.forEach(k => formData.append("keywords", k));

        try {
            const res = await fetch(`${API_BASE_URL}/api/events`, {
                method: "POST",
                body: formData
            });
            if (res.ok) {
                alert("下書きを保存しました");
            } else {
                let err;
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    err = await res.json();
                } else {
                    err = { error: await res.text() };
                }
                alert("下書き保存失敗: " + (err.error || res.status) + (err.trace ? "\n" + err.trace : ""));
            }
        } catch (err) {
            alert("通信エラー: " + err);
        }
    };

    return (
        <div style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "sans-serif" }}>
            <h1>イベント作成</h1>
            <form onSubmit={handleSubmit}>
                <div className="row">
                    <label>タイトル
                        <input type="text" name="title" value={form.title} onChange={handleChange} required maxLength={255} />
                    </label>
                    {errors.title && <div style={{ color: 'red' }}>{errors.title}</div>}
                </div>
                <div className="row">
                    <label>日付
                        <input type="datetime-local" name="date" value={form.date} onChange={handleChange} required min={new Date().toISOString().slice(0, 16)} />
                    </label>
                    {errors.date && <div style={{ color: 'red' }}>{errors.date}</div>}
                </div>
                <div className="row">
                    <label>場所
                        <input type="text" name="location" value={form.location} onChange={handleChange} required maxLength={255} />
                    </label>
                    {errors.location && <div style={{ color: 'red' }}>{errors.location}</div>}
                </div>
                <div className="row">
                    <label>カテゴリ
                        <select name="category" value={form.category} onChange={handleChange} required>
                            <option value="">選択してください</option>
                            {categoryOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </label>
                    {errors.category && <div style={{ color: 'red' }}>{errors.category}</div>}
                </div>
                <div className="row">
                    <label>キーワード</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {keywordOptions.map(opt => (
                            <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: "0.2rem", margin: 0 }}>
                                <input
                                    type="checkbox"
                                    name="keywords"
                                    value={opt.value}
                                    checked={form.keywords.includes(opt.value)}
                                    onChange={handleChange}
                                />
                                {opt.label}
                            </label>
                        ))}
                    </div>
                    {errors.keywords && <div style={{ color: 'red' }}>{errors.keywords}</div>}
                </div>
                <div className="row">
                    <label>画像
                        <input type="file" name="image" accept="image/*" onChange={handleChange} />
                    </label>
                    {preview && <img src={preview} alt="プレビュー" style={{ maxWidth: "100%", maxHeight: 200, marginTop: "0.5rem" }} />}
                    {errors.image && <div style={{ color: 'red' }}>{errors.image}</div>}
                </div>
                <div className="row">
                    <label>イベント概要
                        <textarea name="summary" rows={3} maxLength={200} value={form.summary} onChange={handleChange} required />
                    </label>
                    {errors.summary && <div style={{ color: 'red' }}>{errors.summary}</div>}
                </div>
                <div className="row">
                    <label>イベント詳細
                        <textarea name="detail" rows={5} maxLength={200} value={form.detail} onChange={handleChange} required />
                    </label>
                    {errors.detail && <div style={{ color: 'red' }}>{errors.detail}</div>}
                </div>
                <div className="row">
                    <label>最大人数
                        <input type="number" name="max_participants" value={form.max_participants} onChange={handleChange} min={1} />
                    </label>
                    {errors.max_participants && <div style={{ color: 'red' }}>{errors.max_participants}</div>}
                </div>
                <div className="row">
                    <label>申し込み締め切り日
                        <input type="datetime-local" name="deadline" value={form.deadline} onChange={handleChange} required min={new Date().toISOString().slice(0, 16)} max={form.date || undefined} />
                    </label>
                    {errors.deadline && <div style={{ color: 'red' }}>{errors.deadline}</div>}
                </div>
                <button
                    type="submit"
                    disabled={!isFormComplete()}
                    style={{
                        background: isFormComplete() ? "#1976d2" : "#ccc",
                        color: isFormComplete() ? "#fff" : "#888",
                        cursor: isFormComplete() ? "pointer" : "not-allowed",
                        opacity: isFormComplete() ? 1 : 0.6
                    }}
                >
                    作成
                </button>
                <button type="button" style={{ marginLeft: 8 }} onClick={handleDraft}>下書き保存</button>
            </form>
        </div>
    );
}
