import { useCallback } from "react";
import { getCsrfToken, regenerateCsrfToken } from "../utils/csrfToken";

interface MutationOptions {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
}

/**
 * Hook to validate CSRF token before mutations
 */
export const useCsrfValidation = () => {
  const validateAndExecute = useCallback(
    async <T>(
      mutationFn: () => Promise<T>,
      options: MutationOptions = {}
    ): Promise<T | null> => {
      try {
        // Validate CSRF token before mutation
        const token = getCsrfToken();
        if (!token) {
          const error = new Error(
            "CSRF token validation failed: Token not found"
          );
          options.onError?.(error);
          throw error;
        }

        // Execute the mutation
        const result = await mutationFn();

        // Regenerate token after sensitive operation
        regenerateCsrfToken();

        options.onSuccess?.();
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        options.onError?.(err);
        console.error("CSRF validation failed:", err);
        return null;
      }
    },
    []
  );

  return { validateAndExecute };
};

