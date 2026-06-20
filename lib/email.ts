import { Resend } from "resend";

type EntryNotification = {
  name: string;
  surname: string;
  email: string;
  code: string;
  entryId: string;
};

/**
 * Sends an internal notification on a new registry entry.
 * If RESEND_API_KEY is not configured, the payload is logged instead so the
 * flow never blocks during development.
 */
export async function sendEntryNotification(entry: EntryNotification): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL_TO;
  const from = process.env.NOTIFY_EMAIL_FROM || "onboarding@resend.dev";

  if (!apiKey || !to) {
    console.log("[entry-notification] (email not configured, logging only)", entry);
    return;
  }

  const resend = new Resend(apiKey);
  const lines = [
    `Entry ID: ${entry.entryId}`,
    `Name: ${entry.name} ${entry.surname}`,
    `Email: ${entry.email}`,
    `Code used: ${entry.code}`,
    `Recorded: ${new Date().toISOString()}`,
  ];

  try {
    await resend.emails.send({
      from,
      to,
      subject: `Registry entry recorded — ${entry.entryId}`,
      text: lines.join("\n"),
    });
  } catch (err) {
    // Never let email failure break the registration flow.
    console.error("[entry-notification] send failed:", err);
  }
}
