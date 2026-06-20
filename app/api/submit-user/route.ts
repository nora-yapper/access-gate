import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { getSession, clearSession } from "@/lib/session";
import { validateRegistration } from "@/lib/validation";
import { generateEntryId } from "@/lib/ids";
import { sendEntryNotification } from "@/lib/email";
import { cookies } from "next/headers";

/**
 * POST /api/submit-user
 * Requires a validated session. Records the entry, logs the audit row,
 * triggers the notification email, and hands an entry id to the confirmation
 * screen via a short-lived cookie. The access session is then cleared.
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Session expired." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const result = validateRegistration(body);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  let supabase;
  try {
    supabase = getServiceClient();
  } catch {
    return NextResponse.json({ ok: false, error: "Registry unavailable." }, { status: 503 });
  }

  const entryId = generateEntryId();

  // Store the user.
  const { data: user, error: userError } = await supabase
    .from("users")
    .insert({
      name: result.data.name,
      surname: result.data.surname,
      email: result.data.email,
      code_id: session.code_id,
      entry_id: entryId,
    })
    .select("id")
    .single();

  if (userError || !user) {
    return NextResponse.json({ ok: false, error: "Could not record entry." }, { status: 500 });
  }

  // Resolve the code string + write the audit entry (best-effort).
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    null;

  const { data: codeRow } = await supabase
    .from("codes")
    .select("code")
    .eq("id", session.code_id)
    .maybeSingle();

  await supabase.from("entries").insert({
    user_id: user.id,
    code_id: session.code_id,
    ip_address: ip,
  });

  // Notify (non-blocking on failure).
  await sendEntryNotification({
    name: result.data.name,
    surname: result.data.surname,
    email: result.data.email,
    code: codeRow?.code ?? "—",
    entryId,
  });

  // Hand the entry id to /confirmation and close the access session.
  const store = await cookies();
  store.set("ag_entry", entryId, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 5 * 60,
  });
  await clearSession();

  return NextResponse.json({ ok: true, entryId });
}
