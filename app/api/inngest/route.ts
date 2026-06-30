import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";
import { sendConfirmationEmail } from "@/inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [sendConfirmationEmail],
});
