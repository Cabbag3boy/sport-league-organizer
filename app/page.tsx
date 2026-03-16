import AppClient from "@/app/AppClient";
import { ClientOnly } from "@/components/ClientOnly";
import { cookies } from "next/headers";
import { fetchBootstrapLeagueData } from "@/features/league/services";
import { createPublicServerSupabase } from "@/utils/supabaseServer";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let initialData = null;

  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("lm_access_token")?.value?.trim();
    const supabase = createPublicServerSupabase(accessToken || undefined);
    initialData = await fetchBootstrapLeagueData(supabase);
  } catch (err) {
    // Fall back to client bootstrap if SSR bootstrap fails for any reason.
    console.error("Server bootstrap failed:", err);
  }

  return (
    <ClientOnly
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-900" />
      }
    >
      <AppClient initialData={initialData} />
    </ClientOnly>
  );
}
