import { NextRequest, NextResponse } from "next/server";
import { createUserServerSupabase } from "@/utils/supabaseServer";
import {
  getAccessTokenFromRequest,
  validateAuthenticatedRequest,
} from "@/utils/authValidation";
import { updateLastRoundResultsCore } from "@/features/rounds/services/roundMutationsCore";

type RouteParams = {
  params: Promise<{ roundId: string }>;
};

export async function PATCH(req: NextRequest, context: RouteParams) {
  try {
    const { roundId } = await context.params;
    const accessToken = getAccessTokenFromRequest(req);

    if (!accessToken) {
      return NextResponse.json(
        { error: "Missing session token" },
        { status: 401 },
      );
    }

    const supabase = createUserServerSupabase(accessToken);

    // Validate session token and CSRF token
    const validation = await validateAuthenticatedRequest(supabase, req);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || "Authentication failed" },
        { status: 401 },
      );
    }

    const body = (await req.json()) as {
      leagueId: string;
      newScores: Record<
        string,
        { score1: string; score2: string; note?: string }
      >;
    };

    const data = await updateLastRoundResultsCore(
      supabase,
      body.leagueId,
      roundId,
      body.newScores,
    );

    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
