import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { createSession } from "@/lib/session";
import { normalizeCode } from "@/lib/validation";

/**
 * POST /api/validate-code
 * Body: { code }
 * Checks the registry. On match, opens a validated session and reports success.
 * No mutation.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const code = normalizeCode((body as Record<string, unknown>)?.code);
  if (!code) {
    return NextResponse.json({ ok: false, error: "Code required." }, { status: 400 });
  }

  let supabase;
  try {
    supabase = getServiceClient();
  } catch {
    return NextResponse.json({ ok: false, error: "Registry unavailable." }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("codes")
    .select("id")
    .eq("code", code)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ ok: false, error: "Registry error." }, { status: 500 });
  }

  if (!data) {
    // Not found — no session created.
    return NextResponse.json({ ok: false, error: "Code not found." }, { status: 200 });
  }

  await createSession(data.id);
  return NextResponse.json({ ok: true });
}
