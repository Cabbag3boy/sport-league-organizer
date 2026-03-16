import { NextRequest, NextResponse } from "next/server";
import { createPublicServerSupabase } from "@/utils/supabaseServer";
import {
  getAccessTokenFromRequest,
  validateSessionToken,
} from "@/utils/authValidation";
import { fetchRoundHistoryServer } from "@/features/rounds/services/roundReadService";

type RouteParams = {
  params: Promise<{ seasonId: string }>;
};

export async function GET(req: NextRequest, context: RouteParams) {
  try {
    const { seasonId } = await context.params;
    const accessToken = getAccessTokenFromRequest(req);

    const supabase = createPublicServerSupabase(accessToken ?? undefined);

    if (accessToken) {
      const sessionValidation = await validateSessionToken(supabase, req);

      if (!sessionValidation.valid) {
        return NextResponse.json(
          { error: sessionValidation.error || "Authentication failed" },
          { status: 401 },
        );
      }
    }

    const roundHistory = await fetchRoundHistoryServer(supabase, seasonId);

    return NextResponse.json(roundHistory);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
