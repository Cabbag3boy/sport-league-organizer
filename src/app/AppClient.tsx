"use client";

import App from "@/App";
import type { BootstrapLeagueData } from "@/features/league/services/bootstrapService";

interface AppClientProps {
  initialData?: BootstrapLeagueData | null;
}

export default function AppClient({ initialData }: AppClientProps) {
  return <App initialData={initialData} />;
}
