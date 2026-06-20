import crypto from "crypto";

/** Entry ID shown on the confirmation screen, e.g. "AX-20491". */
export function generateEntryId(): string {
  const n = 10000 + crypto.randomInt(90000); // 5 digits
  return `AX-${n}`;
}
