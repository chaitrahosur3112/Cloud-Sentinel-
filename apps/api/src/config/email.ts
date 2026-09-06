import { BrevoClient } from "@getbrevo/brevo";
import { logger } from "../utils/logger";

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY!,
});

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  try {
    if (!process.env.BREVO_API_KEY) {
      throw new Error("BREVO_API_KEY is not configured");
    }

    if (!process.env.EMAIL_FROM) {
      throw new Error("EMAIL_FROM is not configured");
    }

    const result = await brevo.transactionalEmails.sendTransacEmail({
      sender: {
        name: "CloudCost Sentinel",
        email: process.env.EMAIL_FROM,
      },
      to: [
        {
          email: options.to,
        },
      ],
      subject: options.subject,
      htmlContent: options.html,
    });

    logger.info(`Email sent successfully: ${result.messageId}`);
  } catch (error) {
    logger.error(`Brevo email error: ${String(error)}`);
    throw error;
  }
}