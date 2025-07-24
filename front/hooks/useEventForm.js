import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { validateEventForm } from "../utils/eventValidation";
import { useCachedFetch } from "./useCachedFetch";
import { useImagePreview } from "./useImagePreview";

const API_URL_GET_CATEGORIES = process.env.NEXT_PUBLIC_API_URL_GET_CATEGORIES;
const API_URL_GET_KEYWORDS = process.env.NEXT_PUBLIC_API_URL_GET_KEYWORDS;
const API_URL_CREATE_EVENT = process.env.NEXT_PUBLIC_API_URL_CREATE_EVENT;
const API_URL_DELETE_EVENT = process.env.NEXT_PUBLIC_API_URL_DELETE_EVENT;

export function useEventForm(eventId) {
  const router = useRouter();
  const isEdit = !!eventId;
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
  const [eventData, setEventData] = useState(null);
  const [errors, setErrors] = useState({});

  // カテゴリ・キーワード取得
  const categoryOptions = useCachedFetch(
    "categories",
    API_URL_GET_CATEGORIES,
    c => ({ value: String(c.category_id), label: c.category_name })
  );
  const keywordOptions = useCachedFetch(
    "keywords",
    API_URL_GET_KEYWORDS,
    k => ({ value: String(k.keyword_id), label: k.keyword_name })
  );

  // 画像プレビュー
  const preview = useImagePreview(form.image);

  useEffect(() => {
    if (isEdit && eventId) {
      fetch(API_URL_CREATE_EVENT)
        .then(res => res.json())
        .then(data => {
          setEventData(data);
          setForm({
            title: data.title || "",
            date: data.date || "",
            location: data.location || "",
            category: data.category || "",
            keywords: data.keywords || [],
            summary: data.summary || "",
            detail: data.detail || "",
            deadline: data.deadline || "",
            image: data.image || null,
            max_participants: data.max_participants || ""
          });
        });
    }
  }, [isEdit, eventId]);

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
      setForm((prev) => ({ ...prev, image: file || null }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const v = validateEventForm(form, categoryOptions);
    setErrors(v);
    if (Object.keys(v).length > 0) return;
    // 画像ファイルをDataURL化してlocalStorageに保存
    if (form.image instanceof File) {
      const reader = new FileReader();
      reader.onload = function (ev) {
        localStorage.setItem("eventCreateImage", ev.target.result);
        localStorage.setItem("eventCreateImageName", form.image.name);
        const query = {};
        Object.keys(form).forEach(k => {
          if (k === "image" && form.image) {
            query.image = form.image.name;
          } else {
            query[k] = form[k];
          }
        });
        router.push({
          pathname: '/event/create/confirm',
          query: query
        });
      };
      reader.readAsDataURL(form.image);
    } else {
      localStorage.removeItem("eventCreateImage");
      localStorage.removeItem("eventCreateImageName");
      const query = {};
      Object.keys(form).forEach(k => {
        if (k === "image" && form.image) {
          query.image = form.image.name;
        } else {
          query[k] = form[k];
        }
      });
      router.push({
        pathname: '/event/create/confirm',
        query: query
      });
    }
  };

  const handleDraft = (e) => {
    e.preventDefault();
    if (form.image instanceof File) {
      const reader = new FileReader();
      reader.onload = function (ev) {
        localStorage.setItem("eventCreateImage", ev.target.result);
        localStorage.setItem("eventCreateImageName", form.image.name);
        const query = {};
        Object.keys(form).forEach(k => {
          if (k === "image" && form.image) {
            query.image = form.image.name;
          } else {
            query[k] = form[k];
          }
        });
        query.is_draft = 1;
        router.push({
          pathname: '/event/create/confirm',
          query: query
        });
      };
      reader.readAsDataURL(form.image);
    } else {
      localStorage.removeItem("eventCreateImage");
      localStorage.removeItem("eventCreateImageName");
      const query = {};
      Object.keys(form).forEach(k => {
        if (k === "image" && form.image) {
          query.image = form.image.name;
        } else {
          query[k] = form[k];
        }
      });
      query.is_draft = 1;
      router.push({
        pathname: '/event/create/confirm',
        query: query
      });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("本当にイベントを削除しますか？")) return;
    try {
      const res = await fetch(API_URL_DELETE_EVENT.replace("%7Bevent_id%7D", eventId), {
        method: "DELETE"
      });
      if (res.ok) {
        alert("イベントを削除しました。");
        window.location.href = "/event/create/complete?deleted=1";
      } else {
        let err;
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          err = await res.json();
        } else {
          err = { error: await res.text() };
        }
        alert("削除失敗: " + (err.error || res.status));
      }
    } catch (err) {
      alert("通信エラー: " + err);
    }
  };

  return {
    form,
    setForm,
    errors,
    setErrors,
    preview,
    eventData,
    categoryOptions,
    keywordOptions,
    isEdit,
    handleChange,
    handleSubmit,
    handleDraft,
    handleDelete,
    isFormComplete
  };
}