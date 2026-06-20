import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { RegistrationForm } from "@/components/forms/RegistrationForm";

// Always evaluated at request time — depends on the session cookie.
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const session = await getSession();
  if (!session) {
    // No valid session => back to the checkpoint.
    redirect("/");
  }
  return <RegistrationForm />;
}
