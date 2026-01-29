import { useState, useCallback } from "react";

export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  timestamp: number;
}

export const useNotification = () => {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "success") => {
      const id = Date.now().toString();
      setToast({
        id,
        message,
        type,
        timestamp: Date.now(),
      });

      // Auto-clear after 3 seconds
      setTimeout(() => {
        setToast((current) => (current?.id === id ? null : current));
      }, 3000);
    },
    []
  );

  const clearToast = useCallback(() => {
    setToast(null);
  }, []);

  const handleSecurityError = useCallback(
    (error: unknown) => {
      const isAuthError =
        (error instanceof Error &&
          (error.message.includes("auth") ||
            error.message.includes("Unauthorized") ||
            error.message.includes("401"))) ||
        false;

      if (isAuthError) {
        showToast("Vypršela vaše relace. Přihlaste se prosím znovu.", "error");
        return true;
      }

      const errorMessage =
        error instanceof Error ? error.message : "Bezpečnostní chyba";
      showToast(errorMessage, "error");
      return false;
    },
    [showToast]
  );

  return {
    toast,
    showToast,
    clearToast,
    handleSecurityError,
  };
};

