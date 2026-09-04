import { Router, type IRouter } from "express";
import { pool } from "@workspace/db";
import { requireAdmin } from "./admin";

const router: IRouter = Router();

const fields = [
  "site_name", "tagline", "description", "logo_url", "favicon_url",
  "contact_email", "contact_phone", "contact_phone2", "address", "whatsapp_number", "whatsapp_greeting",
  "linkedin_url", "twitter_url", "facebook_url", "instagram_url", "youtube_url",
  "primary_color", "secondary_color", "accent_color", "theme", "background_color", "font_family",
  "chatbot_enabled", "chatbot_name", "chatbot_greeting", "banner_height", "banner_speed",
] as const;
const numeric = new Set(["banner_height", "banner_speed"]);
const boolean = new Set(["chatbot_enabled"]);
const camel = (name: string) => name.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());

async function availableColumns() {
  const result = await pool.query<{ column_name: string }>(
    "SELECT column_name FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'site_settings'",
  );
  return new Set(result.rows.map((row) => row.column_name));
}

async function loadSettings() {
  const columns = await availableColumns();
  const selected = fields.filter((field) => columns.has(field));
  if (!selected.length) throw new Error("site_settings schema has no supported settings columns");
  let result = await pool.query(`SELECT ${selected.map((field) => `"${field}"`).join(", ")} FROM site_settings ORDER BY id ASC LIMIT 1`);
  if (!result.rows[0]) {
    await pool.query("INSERT INTO site_settings DEFAULT VALUES");
    result = await pool.query(`SELECT ${selected.map((field) => `"${field}"`).join(", ")} FROM site_settings ORDER BY id ASC LIMIT 1`);
  }
  const row = result.rows[0] as Record<string, unknown>;
  return Object.fromEntries(selected.map((field) => [camel(field), row[field] ?? null]));
}

router.get("/settings", async (req, res): Promise<void> => {
  try {
    // This explicit allow-list is the public boundary: provider credentials are never selected.
    res.json(await loadSettings());
  } catch (error) {
    req.log.error({ err: error }, "Unable to load public site settings");
    res.status(500).json({ error: "Unable to load site settings" });
  }
});

router.get("/admin/settings", async (req, res): Promise<void> => {
  if (!(await requireAdmin(req, res))) return;
  try {
    res.json(await loadSettings());
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
    if (!values.length) { res.status(400).json({ error: "No supported settings supplied" }); return; }
    const existing = await pool.query("SELECT id FROM site_settings ORDER BY id ASC LIMIT 1");
    const id = existing.rows[0]?.id ?? (await pool.query("INSERT INTO site_settings DEFAULT VALUES RETURNING id")).rows[0].id;
    const updated = await pool.query(
      `UPDATE site_settings SET ${values.map(([field], index) => `"${field}"=$${index + 1}`).join(", ")}, updated_at=now() WHERE id=$${values.length + 1}`,
      [...values.map(([, value]) => value), id],
    );
    if (!updated.rowCount) { res.status(404).json({ error: "Settings record not found" }); return; }
    req.log.info({ settingCount: values.length }, "Site settings updated");
    res.json(await loadSettings());
  } catch (error) {
    req.log.error({ err: error }, "Unable to save site settings");
    res.status(400).json({ error: error instanceof Error ? error.message : "Unable to save site settings" });
  }
});

export default router;