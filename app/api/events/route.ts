import { NextRequest, NextResponse } from "next/server";
import { createUserServerSupabase } from "@/utils/supabaseServer";
import {
  getAccessTokenFromRequest,
  validateAuthenticatedRequest,
} from "@/utils/authValidation";
import { createEventCore } from "@/features/events/services/eventMutationsCore";
import type { CreateEventInput } from "@/types";

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

    const validation = await validateAuthenticatedRequest(supabase, req);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || "Authentication failed" },
        { status: 401 },
      );
    }

    const input = (await req.json()) as CreateEventInput;
    const event = await createEventCore(supabase, input);
    return NextResponse.json(event);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
