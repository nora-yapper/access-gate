export type RegistrationInput = {
  name: string;
  surname: string;
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
  const name = typeof b.name === "string" ? b.name.trim() : "";
  const surname = typeof b.surname === "string" ? b.surname.trim() : "";
  const email = typeof b.email === "string" ? b.email.trim() : "";

  if (name.length < 1 || name.length > 120) return { ok: false, error: "Name required." };
  if (surname.length < 1 || surname.length > 120) return { ok: false, error: "Surname required." };
  if (!EMAIL_RE.test(email) || email.length > 254) return { ok: false, error: "Valid email required." };

  return { ok: true, data: { name, surname, email } };
}
