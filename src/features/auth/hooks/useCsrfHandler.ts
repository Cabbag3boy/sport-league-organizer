import { useCallback } from "react";
import { useCsrfValidation } from "./useCsrfValidation";

/**
 * Custom hook to wrap async operations with CSRF validation
 * Simplifies the pattern of validateAndExecute calls in handlers
 */

type AsyncFn = () => Promise<void>;

interface CsrfHandlerOptions {
  onError?: (error: unknown) => void;
}

export const useCsrfHandler = () => {
  const { validateAndExecute } = useCsrfValidation();

  const executeWithCsrf = useCallback(
    async (asyncFn: AsyncFn, options?: CsrfHandlerOptions) => {
      return validateAndExecute(asyncFn, {
        onError: (error) => {
          console.error("CSRF validation failed:", error);
          if (options?.onError) {
            options.onError(error);
          }
        },
      });
    },
    [validateAndExecute]
  );

  return { executeWithCsrf };
};

