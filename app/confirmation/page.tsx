import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ConfirmationSequence } from "@/components/forms/ConfirmationSequence";

export const dynamic = "force-dynamic";

export default async function ConfirmationPage() {
  const store = await cookies();
  const entryId = store.get("ag_entry")?.value;
  if (!entryId) {
    // Reached without completing an entry.
    redirect("/");
  }
  return <ConfirmationSequence entryId={entryId} />;
}
