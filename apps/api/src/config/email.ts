import nodemailer, { Transporter } from "nodemailer";
import { logger } from "../utils/logger";

let transporter: Transporter;

export async function getEmailTransporter(): Promise<Transporter> {
  if (transporter) return transporter;

  if (process.env.NODE_ENV === "production") {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 465),
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  } else {
    // Creates a free fake inbox — check the logged preview URL in your terminal
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    logger.info(`Ethereal email account created: ${testAccount.user}`);
  }
  return transporter;
}

export async function sendEmail(options: { to: string; subject: string; html: string }): Promise<void> {
  const transport = await getEmailTransporter();
  const info = await transport.sendMail({
    from: `"CloudCost Sentinel" <noreply@cloudcost.io>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
  if (process.env.NODE_ENV !== "production") {
    logger.info(`Email preview: ${nodemailer.getTestMessageUrl(info)}`);
  }
}