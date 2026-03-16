import { NextRequest, NextResponse } from "next/server";
import { createUserServerSupabase } from "@/utils/supabaseServer";
import {
  getAccessTokenFromRequest,
  validateAuthenticatedRequest,
} from "@/utils/authValidation";
import { completeRoundCore } from "@/features/rounds/services/roundMutationsCore";
import type { CompleteRoundInput } from "@/types";

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

    const payload = (await req.json()) as CompleteRoundInput;
    const data = await completeRoundCore(supabase, payload);

    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
