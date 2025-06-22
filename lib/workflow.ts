import { Client as WorkflowClient } from "@upstash/workflow";
import { Client as QStashClient, resend } from "@upstash/qstash";
import config from "./config";

export const workflowClient = new WorkflowClient({
  baseUrl: config.env.upstash.qstashUrl,
  token: config.env.upstash.qstashToken,
});

const qstashClient = new QStashClient({
  token: config.env.upstash.qstashToken,
});

export const sendEmail = async ({
  email,
  subject,
  message,
}: {
  email: string;
  subject: string;
  message: string;
}) => {
  console.log("Sending to:", email);
  console.log("Subject:", subject);
  console.log("HTML:", message);

  await qstashClient.publishJSON({
    api: {
      name: "email",
      provider: resend({ token: config.env.upstash.resendToken! }),
    },
    body: {
      from: "onboarding@resend.dev>",
      to: "test@resend.dev",
      subject: subject,
      html: message,
    },
  });
};
