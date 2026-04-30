import nodemailer, { Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { env } from './env';

let transporter: Transporter;

export function getMailTransporter(): Transporter {
  if (!transporter) {
    const transportOptions: SMTPTransport.Options & { family?: number } = {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      family: 4, // Force IPv4 — Render free tier cannot route outbound IPv6
      name: 'nezadesigns.com',
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      dnsTimeout: 5000,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    };

    transporter = nodemailer.createTransport(transportOptions);
  }
  return transporter;
}

export async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const transport = getMailTransporter();
  await transport.sendMail({
    from: env.SMTP_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
}
