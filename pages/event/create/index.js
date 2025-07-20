import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import EventForm from "../../../components/EventForm";
import { useKeywords } from "../../../utils/useKeywords";
import { useCategories } from "../../../utils/useCategories";
import { validateEventForm } from "../../../utils/validateEventForm";
import { generateEventQuery } from "../../../utils/generateEventQuery";
import { saveImageToLocalStorage } from "../../../utils/saveImageToLocalStorage";
import { getCategories } from "../../../utils/getCategories";
import { getKeywords } from "../../../utils/getKeywords";

const API_URL_CREATE_EVENT = process.env.NEXT_PUBLIC_API_URL_CREATE_EVENT;
const API_URL_DELETE_EVENT = process.env.NEXT_PUBLIC_API_URL_DELETE_EVENT;

export default function EventCreate() {
  const router = useRouter();
  const eventId = router.query.event_id;
  const isEdit = !!eventId;

  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({
    title: "",
    date: "",
    location: "",
    category: "",
    keywords: [],
    summary: "",
    detail: "",
    max_participants: "",
    deadline: "",
    image: null,
  });
  const [eventData, setEventData] = useState(null);

  const [categoryOptions, setCategories] = useState([]); // ✅ useCategoriesフックで取得
  const [keywords, setKeywords] = useState([]);

  useEffect(() => {
    async function fetchCategories() {
      const cats = await getCategories();
      setCategories(cats);
    }
    fetchCategories();

    async function fetchKeywords() {
      const kw = await getKeywords();
      setKeywords(kw);
    }
    fetchKeywords();

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
            image: null,
            max_participants: data.max_participants || ""
          });
          setPreview(null);
        });
    }

    async function fetchCategories() {
      const cats = await getCategories();
      setCategories(cats);
    }
    fetchCategories();
  }, [isEdit, eventId]);

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, checked, files } = e.target;

    if (name === "keywords") {
        const keywordId = Number(value); // 🔑 数値に変換

        setForm(prev => {
            const newKeywords = checked
                ? [...prev.keywords, keywordId]
                : prev.keywords.filter(k => k !== keywordId);
            return { ...prev, keywords: newKeywords };
        });
    } else if (name === "category") {
      const categoryId = Number(value); // 🔑 ここがカテゴリー対応部分
      setForm(prev => ({ ...prev, category: categoryId }));
    } else if (files) {
        setForm(prev => ({ ...prev, [name]: files[0] }));
    } else {
        setForm(prev => ({ ...prev, [name]: value }));
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
    const v = validateEventForm(form);
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    const onComplete = () => {
      const query = generateEventQuery(form);
      router.push({
        pathname: "/event/create/confirm",
        query
      });
    };

    if (form.image instanceof File) {
      saveImageToLocalStorage(form.image, onComplete);
    } else {
      localStorage.removeItem("eventCreateImage");
      localStorage.removeItem("eventCreateImageName");
      onComplete();
    }
  };

  const handleDraft = (e) => {
    e.preventDefault();

    const onComplete = () => {
      const query = generateEventQuery(form);
      query.is_draft = 1;
      router.push({
        pathname: "/event/create/confirm",
        query
      });
    };

    if (form.image instanceof File) {
      saveImageToLocalStorage(form.image, onComplete);
    } else {
      localStorage.removeItem("eventCreateImage");
      localStorage.removeItem("eventCreateImageName");
      onComplete();
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

  return (
    <EventForm
      form={form}
      errors={errors}
      preview={preview}
      eventData={eventData}
      categoryOptions={categoryOptions}
      keywords={keywords}
      isEdit={isEdit}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onDraft={handleDraft}
      onDelete={isEdit ? handleDelete : undefined}
      isFormComplete={isFormComplete}
      submitLabel={isEdit ? "更新" : "作成"}
      draftLabel="下書き保存"
      deleteLabel="イベント取り消し"
      deadlineType="datetime-local"
    />
  );
}
