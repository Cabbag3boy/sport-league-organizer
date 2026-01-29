/**
 * Centralized error handling utility for service layer
 * Checks for security errors (JWT, auth, CSRF) and normalizes error messages
 */

export interface ServiceErrorResult {
  isSecurityError: boolean;
  message: string;
}

export function handleServiceError(
  error: unknown,
  defaultMessage: string
): ServiceErrorResult {
  // Check for JWT/auth errors
  if (error instanceof Error) {
    const message = error.message || "";
    if (
      message.includes("JWT") ||
      message.includes("401") ||
      message.includes("403") ||
      message.includes("Unauthorized") ||
      message.includes("Forbidden")
    ) {
      return {
        isSecurityError: true,
        message: "Vaše relace vypršela nebo nemáte dostatečná oprávnění.",
      };
    }
  }

  // Check for object with status property
  if (error && typeof error === "object" && "status" in error) {
    const status = (error as any).status;
    if (status === 401 || status === 403) {
      return {
        isSecurityError: true,
        message: "Vaše relace vypršela nebo nemáte dostatečná oprávnění.",
      };
    }
  }

  // Check for CSRF validation errors
  if (error && typeof error === "object" && "message" in error) {
    const msg = (error as any).message || "";
    if (msg.includes("CSRF") || msg.includes("security")) {
      return {
        isSecurityError: true,
        message: "Bezpečnostní kontrola se nezdařila. Zkuste znovu.",
      };
    }
  }

  // Default non-security error
  return {
    isSecurityError: false,
    message: defaultMessage,
  };
}

/**
 * Hook to handle service errors with toast notifications
 * @param showToast - Toast notification function from useNotification hook
 * @returns notifyError function to call when catching errors
 */
export const useServiceError = (
  showToast: (message: string, type: "success" | "error" | "info") => void
) => {
  const notifyError = (error: unknown, defaultMessage: string): void => {
    const { message } = handleServiceError(error, defaultMessage);
    showToast(message, "error");
  };

  return { notifyError };
};

