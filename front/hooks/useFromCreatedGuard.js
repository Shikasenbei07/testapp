import { useEffect, useState } from "react";

export function useFromCreatedGuard() {
  const [isValid, setIsValid] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fromCreated = localStorage.getItem("fromCreated");
    if (fromCreated === "1") {
      setIsValid(true);
      localStorage.removeItem("fromCreated");
    } else {
      setIsValid(false);
    }
  }, []);

  return isValid;
}