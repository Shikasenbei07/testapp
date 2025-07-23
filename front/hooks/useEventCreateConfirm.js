import { useState, useEffect, useCallback } from "react";

export function useEventCreateConfirm(router) {
  const [formValues, setFormValues] = useState(null);
  const [image, setImage] = useState(null);
  const [imageName, setImageName] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [keywordNames, setKeywordNames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!router.isReady) return;

    // 新規作成時は event_id がない場合もある
    // router.query から値を取得してセット
    const {
      title,
      date,
      location,
      category,
      keywords,
      summary,
      detail,
      deadline,
      max_participants,
      is_draft,
      imageName: queryImageName,
      categoryName: queryCategoryName,
      keywordNames: queryKeywordNames
    } = router.query;

    // 画像は router.query からは取得できないため、必要に応じて別途セットする
    setFormValues({
      title: title || "",
      date: date || "",
      location: location || "",
      category: category || "",
      keywords: keywords ? (Array.isArray(keywords) ? keywords : [keywords]) : [],
      summary: summary || "",
      detail: detail || "",
      deadline: deadline || "",
      max_participants: max_participants || "",
      is_draft: is_draft || "0"
    });
    setImageName(queryImageName || null);
    setCategoryName(queryCategoryName || "");
    setKeywordNames(queryKeywordNames ? (Array.isArray(queryKeywordNames) ? queryKeywordNames : [queryKeywordNames]) : []);
    // imageは親コンポーネントからsetImageで渡す想定

  }, [router.isReady, router.query]);

  const handleConfirm = useCallback(async () => {
    if (!formValues) return;
    const API_URL_CREATE_EVENT = process.env.NEXT_PUBLIC_API_URL_CREATE_EVENT;
    if (!API_URL_CREATE_EVENT) {
      setError("APIのURLが設定されていません。管理者に連絡してください。");
      return;
    }
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("creator", localStorage.getItem("id"));
    formData.append("title", formValues.title);
    formData.append("date", formValues.date);
    formData.append("location", formValues.location);
    formData.append("category", formValues.category);
    formData.append("summary", formValues.summary);
    formData.append("detail", formValues.detail);
    formData.append("deadline", formValues.deadline);
    formData.append("max_participants", formValues.max_participants);
    (formValues.keywords || []).forEach(k => formData.append("keywords", k));

    if (image) formData.append("image", image, imageName);
    formData.append("is_draft", String(formValues.is_draft) === "1" ? 1 : 0);
    
    try {
      const res = await fetch(API_URL_CREATE_EVENT, {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        if (formValues.is_draft === "1") {
            alert("下書きとして保存しました。");
        } else {
            router.push(`/event/create/complete`);
        }
      } else {
        let err;
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          err = await res.json();
        } else {
          err = { error: await res.text() };
        }
        setError("登録失敗: " + (err.error || res.status) + (err.trace ? "\n" + err.trace : ""));
      }
    } catch (err) {
      setError("通信エラー: " + err);
    }
    setLoading(false);
  }, [formValues, image, imageName, router]);

  const handleBack = useCallback(() => {
    if (!formValues) return;
    const saveData = {
      title: formValues.title,
      date: formValues.date,
      location: formValues.location,
      category: formValues.category,
      keywords: formValues.keywords,
      summary: formValues.summary,
      detail: formValues.detail,
      deadline: formValues.deadline,
      max_participants: formValues.max_participants
    };
    localStorage.setItem("eventCreateDraft", JSON.stringify(saveData));
    router.back();
  }, [formValues, router]);

  return {
    formValues,
    setFormValues,
    image,
    setImage,
    imageName,
    setImageName,
    categoryName,
    setCategoryName,
    keywordNames,
    setKeywordNames,
    loading,
    setLoading,
    error,
    setError,
    handleConfirm,
    handleBack
  };
}