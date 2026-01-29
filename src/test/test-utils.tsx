import { render, RenderOptions } from "@testing-library/react";
import React, { ReactElement } from "react";
import { useAuthStore } from "../stores";
import type { Session } from "@supabase/supabase-js";

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  session?: Session | null;
}

export const renderWithProviders = (
  ui: ReactElement,
  { session = null, ...renderOptions }: CustomRenderOptions = {}
) => {
  // Initialize auth store with session
  if (session) {
    useAuthStore.setState({ session });
  }

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    children as React.ReactElement;

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

export * from "@testing-library/react";
export { renderWithProviders as render };

