import { Router, type IRouter } from "express";
import { pool } from "@workspace/db";
import { requireAdmin } from "./admin";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const router: IRouter = Router();

const publicFields = [
  "site_name", "tagline", "description", "site_url", "logo_url", "favicon_url",
  "contact_email", "contact_phone", "contact_phone2", "address", "whatsapp_number", "whatsapp_greeting",
  "linkedin_url", "twitter_url", "facebook_url", "instagram_url", "youtube_url",
  "primary_color", "secondary_color", "accent_color", "theme", "background_color", "font_family",
  "chatbot_enabled", "chatbot_name", "chatbot_greeting", "banner_height", "banner_speed", "analytics_id",
] as const;
const protectedFields = [
  "chatbot_model",
  "smtp_host", "smtp_port", "smtp_username", "smtp_from_address",
  "sms_provider", "sms_sender_id",
  "whatsapp_provider",
  "ai_provider", "ai_model", "ai_base_url",
] as const;
const fields = [...publicFields, ...protectedFields] as const;
const numeric = new Set(["banner_height", "banner_speed", "smtp_port"]);
const boolean = new Set(["chatbot_enabled"]);
const camel = (name: string) => name.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
const secretFields = {
  smtpPassword: "smtp_password_encrypted",
  smsApiKey: "sms_api_key_encrypted",
  whatsappApiKey: "whatsapp_api_key_encrypted",
  aiApiKey: "ai_api_key_encrypted",
} as const;
const secretMask = "••••••••";

function encryptionKey() {
  if (!process.env.SESSION_SECRET) throw new Error("SESSION_SECRET is required to protect provider credentials");
  return createHash("sha256").update(process.env.SESSION_SECRET).digest();
}

export function encryptSetting(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return `${iv.toString("base64")}.${cipher.getAuthTag().toString("base64")}.${encrypted.toString("base64")}`;
}

export function decryptSetting(value: string) {
  const [iv, tag, encrypted] = value.split(".");
  if (!iv || !tag || !encrypted) throw new Error("Stored credential is invalid");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(encrypted, "base64")), decipher.final()]).toString("utf8");
}

async function availableColumns() {
  const result = await pool.query<{ column_name: string }>(
    "SELECT column_name FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'site_settings'",
  );
  return new Set(result.rows.map((row) => row.column_name));
}

async function loadSettings(admin = false) {
  const columns = await availableColumns();
  const requested = admin ? fields : publicFields;
  const selected = requested.filter((field) => columns.has(field));
  const selectedSecrets = admin ? Object.values(secretFields).filter((field) => columns.has(field)) : [];
  if (!selected.length) throw new Error("site_settings schema has no supported settings columns");
  const selection = [...selected, ...selectedSecrets].map((field) => `"${field}"`).join(", ");
  let result = await pool.query(`SELECT ${selection} FROM site_settings ORDER BY id ASC LIMIT 1`);
  if (!result.rows[0]) {
    await pool.query("INSERT INTO site_settings DEFAULT VALUES");
    result = await pool.query(`SELECT ${selection} FROM site_settings ORDER BY id ASC LIMIT 1`);
  }
  const row = result.rows[0] as Record<string, unknown>;
  const response = Object.fromEntries(selected.map((field) => [camel(field), row[field] ?? null]));
  if (admin) {
    for (const [key, field] of Object.entries(secretFields)) {
      response[`${key}Set`] = Boolean(row[field]);
      response[key] = row[field] ? secretMask : null;
    }
  }
  return response;
}

router.get("/settings", async (req, res): Promise<void> => {
  try {
    // This explicit allow-list is the public boundary: provider credentials are never selected.
    res.json(await loadSettings(false));
  } catch (error) {
    req.log.error({ err: error }, "Unable to load public site settings");
    res.status(500).json({ error: "Unable to load site settings" });
  }
});

router.get("/admin/settings", async (req, res): Promise<void> => {
  if (!(await requireAdmin(req, res))) return;
  try {
    res.json(await loadSettings(true));
  } catch (error) {
    req.log.error({ err: error }, "Unable to load site settings");
    res.status(500).json({ error: "Unable to load site settings" });
  }
});

router.put("/admin/settings", async (req, res): Promise<void> => {
  if (!(await requireAdmin(req, res))) return;
  try {
    const columns = await availableColumns();
    const values: Array<[string, unknown]> = [];
    for (const field of fields) {
      const key = camel(field);
      if (!columns.has(field) || req.body?.[key] === undefined) continue;
      const value = req.body[key];
      if (numeric.has(field) && (!Number.isFinite(Number(value)) || Number(value) < 0)) {
        res.status(400).json({ error: `${key} must be a non-negative number` }); return;
      }
      values.push([field, boolean.has(field) ? value === true : numeric.has(field) ? Number(value) : value === "" ? null : value]);
    }
    for (const [key, field] of Object.entries(secretFields)) {
      if (!columns.has(field) || req.body?.[key] === undefined) continue;
      const value = typeof req.body[key] === "string" ? req.body[key].trim() : "";
      if (!value || value === secretMask) continue;
      if (value.length > 10000) {
        res.status(400).json({ error: `${key} is too long` });
        return;
      }
      values.push([field, encryptSetting(value)]);
    }
    if (!values.length) { res.status(400).json({ error: "No supported settings supplied" }); return; }
    const existing = await pool.query("SELECT id FROM site_settings ORDER BY id ASC LIMIT 1");
    const id = existing.rows[0]?.id ?? (await pool.query("INSERT INTO site_settings DEFAULT VALUES RETURNING id")).rows[0].id;
    const updated = await pool.query(
      `UPDATE site_settings SET ${values.map(([field], index) => `"${field}"=$${index + 1}`).join(", ")}, updated_at=now() WHERE id=$${values.length + 1}`,
      [...values.map(([, value]) => value), id],
    );
    if (!updated.rowCount) { res.status(404).json({ error: "Settings record not found" }); return; }
    req.log.info({ settingCount: values.length }, "Site settings updated");
    res.json(await loadSettings(true));
  } catch (error) {
    req.log.error({ err: error }, "Unable to save site settings");
    res.status(400).json({ error: error instanceof Error ? error.message : "Unable to save site settings" });
  }
});

export default router;