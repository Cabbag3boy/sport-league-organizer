import { NextRequest, NextResponse } from "next/server";
import { createUserServerSupabase } from "@/utils/supabaseServer";
import {
  getAccessTokenFromRequest,
  validateAuthenticatedRequest,
} from "@/utils/authValidation";
import {
  addPlayerCore,
  addExistingPlayerCore,
} from "@/features/players/services/playerMutationsCore";
import type { AddPlayerInput, AddExistingPlayerInput } from "@/types";

export async function POST(req: NextRequest) {
  try {
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

    const body = await req.json();

    // Determine which type of add operation based on the presence of playerName or playerId
    if ("playerName" in body && "leagueId" in body) {
      // addPlayer operation
      const input = body as AddPlayerInput;
      const data = await addPlayerCore(supabase, input);
      return NextResponse.json(data);
    } else if ("playerId" in body && "leagueId" in body) {
      // addExistingPlayer operation
      const input = body as AddExistingPlayerInput;
      const data = await addExistingPlayerCore(supabase, input);
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
