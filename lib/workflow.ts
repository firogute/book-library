import { Client as WorkflowClient } from "@upstash/workflow";
import config from "./config";
import emailjs from "@emailjs/browser";

const serviceId = config.env.emailServiceId;

export const workflowClient = new WorkflowClient({
  baseUrl: config.env.upstash.qstashUrl,
  token: config.env.upstash.qstashToken,
});

export const sendEmail = async (
  templateId: string,
  templateParams: Record<string, unknown>
) => {
  try {
    emailjs.init({
      publicKey: config.env.emailJsToken,
    });

    const res = await emailjs.send(serviceId, templateId, templateParams);
    console.log(res);
  } catch (error) {
    console.error(error);
  }
};
