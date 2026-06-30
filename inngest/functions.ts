import { inngest } from "@/lib/inngest";
import { sendRegistrationConfirmation } from "@/lib/email";

export const sendConfirmationEmail = inngest.createFunction(
  { id: "send-confirmation-email", triggers: [{ event: "app/user.registered" }] },
  async ({ event, step }) => {
    await step.sleep("wait-before-sending", "2m");
    await step.run("send-email", () =>
      sendRegistrationConfirmation({
        fullName: event.data.fullName,
        email: event.data.email,
      })
    );
  }
);
