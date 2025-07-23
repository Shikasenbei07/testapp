import { useRouter } from "next/router";
import EventForm from "../../../components/EventForm";
import { useEventForm } from "../../../hooks/useEventForm";

export default function EventCreate() {
  const router = useRouter();
  const eventId = router.query.event_id;
  const eventForm = useEventForm(eventId);

  return (
    <EventForm
      form={eventForm.form}
      errors={eventForm.errors}
      preview={eventForm.preview}
      eventData={eventForm.eventData}
      categoryOptions={eventForm.categoryOptions}
      keywordOptions={eventForm.keywordOptions}
      isEdit={eventForm.isEdit}
      onChange={eventForm.handleChange}
      onSubmit={eventForm.handleSubmit}
      onDraft={eventForm.handleDraft}
      isFormComplete={eventForm.isFormComplete}
      submitLabel={eventForm.isEdit ? "更新" : "作成"}
      draftLabel={"下書き保存"}
      deadlineType="datetime-local"
    />
  );
}