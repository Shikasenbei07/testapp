export function validateEventForm(data, categoryOptions) {
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
}