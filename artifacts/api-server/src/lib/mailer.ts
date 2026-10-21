import nodemailer from "nodemailer";
import { pool } from "@workspace/db";
import { decryptSetting } from "../routes/settings";

type SmtpRow = {
  smtp_host?: string | null;
  smtp_port?: number | null;
  smtp_username?: string | null;
  smtp_password_encrypted?: string | null;
  smtp_from_address?: string | null;
  site_name?: string | null;
};

export type MailMessage = { to: string; subject: string; text: string; html: string };

// SMTP is configured in Admin -> System Settings -> SMTP. Returns null when it is not set up.
async function loadTransport() {
  // SELECT * keeps this working on databases that predate the SMTP columns.
  const result = await pool.query<SmtpRow>("SELECT * FROM site_settings ORDER BY id ASC LIMIT 1");
  const row = result.rows[0];
  if (!row?.smtp_host || !row.smtp_from_address) return null;
  const port = Number(row.smtp_port) || 587;
  const transport = nodemailer.createTransport({
    host: row.smtp_host,
    port,
    secure: port === 465,
    auth: row.smtp_username
      ? { user: row.smtp_username, pass: row.smtp_password_encrypted ? decryptSetting(row.smtp_password_encrypted) : "" }
      : undefined,
  });
  const from = row.site_name ? `"${row.site_name.replace(/"/g, "")}" <${row.smtp_from_address}>` : row.smtp_from_address;
  return { transport, from };
}

/** Sends an email through the admin-configured SMTP server. Returns false when SMTP is not configured. */
export async function sendMail(message: MailMessage): Promise<boolean> {
  const smtp = await loadTransport();
  if (!smtp) return false;
  await smtp.transport.sendMail({ from: smtp.from, ...message });
  return true;
}
