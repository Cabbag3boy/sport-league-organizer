"use client";

import { ReactNode, useEffect, useState } from "react";

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * ClientOnly Component
 * Ensures content is only rendered after client-side hydration is complete.
 * This prevents hydration mismatches when using Zustand persist or other client-only features.
 */
export function ClientOnly({
  children,
  fallback = null,
}: ClientOnlyProps): ReactNode {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return fallback;
  }

  return children;
}
