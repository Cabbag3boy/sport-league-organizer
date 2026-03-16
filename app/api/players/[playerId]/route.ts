import { NextRequest, NextResponse } from "next/server";
import { createUserServerSupabase } from "@/utils/supabaseServer";
import {
  getAccessTokenFromRequest,
  validateAuthenticatedRequest,
} from "@/utils/authValidation";
import { removePlayerCore } from "@/features/players/services/playerMutationsCore";
import type { RemovePlayerInput } from "@/types";

type RouteParams = {
  params: Promise<{ playerId: string }>;
};

export async function DELETE(req: NextRequest, context: RouteParams) {
  try {
    const { playerId } = await context.params;
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

    const body = (await req.json()) as { leagueId: string };
    const input: RemovePlayerInput = {
      playerId,
      leagueId: body.leagueId,
    };

    await removePlayerCore(supabase, input);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
