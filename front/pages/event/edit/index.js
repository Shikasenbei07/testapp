import EventForm from "../../../components/EventForm";
import { useEventEditForm } from "../../../hooks/useEventEditForm";

export default function EventEdit() {
    const eventForm = useEventEditForm();

    return (
        <EventForm
            form={eventForm.form}
            errors={eventForm.errors}
            preview={eventForm.preview}
            eventData={eventForm.form}
            categoryOptions={eventForm.categoryOptions}
            keywordOptions={eventForm.keywordOptions}
            isEdit={true}
            onChange={eventForm.handleChange}
            onSubmit={eventForm.handleConfirmPage}
            onDraft={eventForm.handleDraft}
            onDelete={eventForm.handleDeleteConfirmPage}
            isFormComplete={eventForm.isFormComplete}
            submitLabel={"確認"}
            draftLabel={"下書き保存"}
            deleteLabel={"イベント取り消し"}
        />
    );
}
