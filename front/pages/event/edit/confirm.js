import { useEventEditConfirm } from "../../../hooks/useEventEditConfirm";
import EventEditConfirmView from "../../../components/EventEditConfirmView";

export default function EventEditConfirm() {
    const {
        formValues,
        categoryName,
        keywordNames,
        loading,
        error,
        handleConfirm,
        handleBack
    } = useEventEditConfirm();

    if (!formValues) {
        return <div>読み込み中...</div>;
    }

    return (
        <EventEditConfirmView
            formValues={formValues}
            categoryName={categoryName}
            keywordNames={keywordNames}
            loading={loading}
            error={error}
            onConfirm={handleConfirm}
            onBack={handleBack}
        />
    );
}
