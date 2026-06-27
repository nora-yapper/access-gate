export type RegistrationInput = {
  fullName: string;
  email: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeCode(raw: unknown): string {
  return typeof raw === "string" ? raw.trim().toUpperCase() : "";
}

/** Validates + trims registration fields. Returns cleaned data or an error. */
export function validateRegistration(
  body: unknown
): { ok: true; data: RegistrationInput } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Invalid payload." };
  }
  const b = body as Record<string, unknown>;
  const fullName = typeof b.fullName === "string" ? b.fullName.trim() : "";
  const email = typeof b.email === "string" ? b.email.trim() : "";

  if (fullName.length < 1 || fullName.length > 241) return { ok: false, error: "Full name required." };
  if (!EMAIL_RE.test(email) || email.length > 254) return { ok: false, error: "Valid email required." };

  return { ok: true, data: { fullName, email } };
}
