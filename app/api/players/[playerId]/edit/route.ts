import { NextRequest, NextResponse } from "next/server";
import { createUserServerSupabase } from "@/utils/supabaseServer";
import {
  getAccessTokenFromRequest,
  validateAuthenticatedRequest,
} from "@/utils/authValidation";
import { updatePlayerCore } from "@/features/players/services/playerMutationsCore";
import type { UpdatePlayerInput } from "@/types";

type RouteParams = {
  params: Promise<{ playerId: string }>;
};

export async function PATCH(req: NextRequest, context: RouteParams) {
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

    const body = (await req.json()) as {
      first_name: string;
      last_name: string;
      rank: number;
      leagueId: string;
    };

    const input: UpdatePlayerInput = {
      id: playerId,
      first_name: body.first_name,
      last_name: body.last_name,
      rank: body.rank,
      leagueId: body.leagueId,
    };

    const data = await updatePlayerCore(supabase, input);
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
