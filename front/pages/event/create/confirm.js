import { useRouter } from "next/router";
import { useEffect } from "react";
import { useEventCreateConfirm } from "../../../hooks/useEventCreateConfirm";
import EventCreateConfirmView from "../../../components/EventCreateConfirmView";

function EventCreateConfirm() {
  const router = useRouter();
  const {
    formValues,
    image,
    imageName,
    categoryName,
    keywordNames,
    loading,
    error,
    handleConfirm,
    handleBack
  } = useEventCreateConfirm(router);

  useEffect(() => {
    if (!router.isReady) return;
    // event_idなどのパラメータ取得・APIリクエスト処理
  }, [router.isReady, router.query]);

  return (
    <EventCreateConfirmView
      formValues={formValues}
      image={image}
      imageName={imageName}
      categoryName={categoryName}
      keywordNames={keywordNames}
      error={error}
      loading={loading}
      onConfirm={() => handleConfirm()}
      onBack={handleBack}
    />
  );
}

export default EventCreateConfirm;
