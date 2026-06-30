import { Resend } from "resend";

type EntryNotification = {
  fullName: string;
  email: string;
  code: string;
  entryId: string;
};

export async function sendRegistrationConfirmation(entry: {
  fullName: string;
  email: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const calendlyUrl = process.env.CALENDLY_URL;

  if (!apiKey) {
    console.log("[registration-confirmation] (Resend not configured, logging only)", entry);
    return;
  }

  const firstName = entry.fullName.trim().split(" ")[0];
  const resend = new Resend(apiKey);

  const text = `Hi ${firstName},

Thanks for your interest in Project01.

Project01 helps founders build their startups step by step, from idea to product, in one place.

Before launching publicly, we're inviting a small number of people to get early access.

To claim yours, book a session below:

${calendlyUrl ?? ""}

We'll walk you through Project01, answer any questions, and get you set up.

As a thank you, everyone who completes a session will receive one month of free access.

Looking forward to meeting you.

—
Antonia, Nora & Vitomir
Project01 Crew`;

  try {
    await resend.emails.send({
      from: "Project01 <info@project01.io>",
      to: entry.email,
      subject: "You're in.",
      text,
    });
  } catch (err) {
    console.error("[registration-confirmation] send failed:", err);
  }
}

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
    `Name: ${entry.fullName}`,
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
