import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/utils/supabaseServer";
import { getAccessTokenFromRequest, validateAuthenticatedRequest } from "@/utils/authValidation";
import { deleteLastRoundCore } from "@/features/rounds/services/roundMutationsCore";
import type { Player } from "@/types";

type RouteParams = {
  params: Promise<{ roundId: string }>;
};

export async function DELETE(req: NextRequest, context: RouteParams) {
  try {
    const { roundId } = await context.params;
    const accessToken = getAccessTokenFromRequest(req);

    if (!accessToken) {
      return NextResponse.json(
        { error: "Missing session token" },
        { status: 401 },
      );
    }

    const supabase = createServerSupabase(accessToken);

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
      playersBefore: Player[];
    };

    const data = await deleteLastRoundCore(
      supabase,
      body.leagueId,
      roundId,
      body.playersBefore,
    );

    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
