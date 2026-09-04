import { Router, type IRouter } from "express";
import { pool } from "@workspace/db";
import { requireAdmin } from "./admin";

const router: IRouter = Router();
const validTypes = new Set(["email", "sms", "whatsapp"]);
const merge = (template: string, recipient: Record<string, string>) => template.replace(/\{(\w+)\}/g, (_, key) => recipient[key] ?? `{${key}}`);
const validId = (id: string) => Number.isSafeInteger(Number(id)) && Number(id) > 0 ? Number(id) : null;

async function audience(filter: unknown) {
  const value = (filter && typeof filter === "object" ? filter : {}) as { source?: string; ids?: unknown[] };
  const ids = Array.isArray(value.ids) ? value.ids.map(Number).filter(Number.isSafeInteger) : [];
  if (value.source === "selected" && ids.length) {
    return (await pool.query<{ id: number; name: string; email: string; phone: string | null }>(
      "SELECT id, name, email, phone FROM contact_inquiries WHERE marketing_consent = true AND id = ANY($1::int[])", [ids],
    )).rows;
  }
  return (await pool.query<{ id: number; name: string; email: string; phone: string | null }>(
    "SELECT id, name, email, phone FROM contact_inquiries WHERE marketing_consent = true",
  )).rows;
}
const campaign = (row: Record<string, unknown>) => ({
  ...row, audienceFilter: row.audience_filter, sentAt: row.sent_at, createdAt: row.created_at, updatedAt: row.updated_at,
});

router.get("/admin/marketing/overview", async (req, res): Promise<void> => {
  if (!(await requireAdmin(req, res))) return;
  const result = await pool.query(`SELECT
    (SELECT count(*)::int FROM campaigns) AS "campaignsTotal",
    (SELECT count(*)::int FROM campaigns WHERE status = 'draft') AS "draftCampaigns",
    (SELECT count(*)::int FROM campaigns WHERE status = 'scheduled') AS "scheduledCampaigns",
    (SELECT count(*)::int FROM contact_inquiries) AS "contactsTotal",
    (SELECT count(*)::int FROM contact_inquiries WHERE marketing_consent) AS "marketableContacts"`);
  res.json(result.rows[0]);
});
router.get("/admin/campaigns", async (req, res): Promise<void> => {
  if (!(await requireAdmin(req, res))) return;
  const rows = await pool.query("SELECT * FROM campaigns ORDER BY created_at DESC, id DESC");
  res.json(rows.rows.map(campaign));
});
router.get("/admin/campaigns/:id", async (req, res): Promise<void> => {
  if (!(await requireAdmin(req, res))) return;
  const id = validId(req.params.id); if (!id) { res.status(400).json({ error: "Invalid campaign" }); return; }
  const row = (await pool.query("SELECT * FROM campaigns WHERE id=$1", [id])).rows[0];
  if (!row) { res.status(404).json({ error: "Campaign not found" }); return; }
  const recipients = await pool.query("SELECT * FROM campaign_recipients WHERE campaign_id=$1 ORDER BY id", [id]);
  res.json({ ...campaign(row), recipients: recipients.rows });
});
router.post("/admin/campaigns", async (req, res): Promise<void> => {
  if (!(await requireAdmin(req, res))) return;
  const body = req.body ?? {};
  if (typeof body.name !== "string" || !body.name.trim() || !validTypes.has(body.type)) { res.status(400).json({ error: "A name and email, sms, or whatsapp type are required" }); return; }
  const row = await pool.query("INSERT INTO campaigns (name,type,subject,body,status,audience_filter,stats) VALUES ($1,$2,$3,$4,'draft',$5::jsonb,'{}'::jsonb) RETURNING *",
    [body.name.trim(), body.type, typeof body.subject === "string" ? body.subject : "", typeof body.body === "string" ? body.body : "", JSON.stringify(body.audienceFilter ?? {})]);
  req.log.info({ campaignId: row.rows[0].id }, "Campaign draft created");
  res.status(201).json(campaign(row.rows[0]));
});
router.patch("/admin/campaigns/:id", async (req, res): Promise<void> => {
  if (!(await requireAdmin(req, res))) return;
  const id = validId(req.params.id); const body = req.body ?? {};
  if (!id) { res.status(400).json({ error: "Invalid campaign" }); return; }
  const allowed = ["name", "type", "subject", "body", "status", "audience_filter"] as const;
  const values = allowed.flatMap((field) => {
    const key = field === "audience_filter" ? "audienceFilter" : field;
    return body[key] === undefined ? [] : [[field, field === "audience_filter" ? JSON.stringify(body[key]) : body[key]] as [string, unknown]];
  });
  if (values.some(([field, value]) => field === "type" && (!validTypes.has(String(value)))) || values.some(([field, value]) => field === "status" && !["draft", "scheduled"].includes(String(value)))) { res.status(400).json({ error: "Invalid campaign type or status" }); return; }
  if (!values.length) { res.status(400).json({ error: "No campaign values supplied" }); return; }
  const row = await pool.query(`UPDATE campaigns SET ${values.map(([field], i) => `${field}=$${i + 1}${field === "audience_filter" ? "::jsonb" : ""}`).join(",")},updated_at=now() WHERE id=$${values.length + 1} RETURNING *`, [...values.map(([, value]) => value), id]);
  if (!row.rows[0]) { res.status(404).json({ error: "Campaign not found" }); return; }
  res.json(campaign(row.rows[0]));
});
router.delete("/admin/campaigns/:id", async (req, res): Promise<void> => {
  if (!(await requireAdmin(req, res))) return;
  const id = validId(req.params.id); if (!id) { res.status(400).json({ error: "Invalid campaign" }); return; }
  const deleted = await pool.query("DELETE FROM campaigns WHERE id=$1 RETURNING id", [id]);
  if (!deleted.rows[0]) { res.status(404).json({ error: "Campaign not found" }); return; }
  res.sendStatus(204);
});
router.post("/admin/campaigns/:id/prepare", async (req, res): Promise<void> => {
  if (!(await requireAdmin(req, res))) return;
  const id = validId(req.params.id); if (!id) { res.status(400).json({ error: "Invalid campaign" }); return; }
  const item = (await pool.query("SELECT * FROM campaigns WHERE id=$1", [id])).rows[0];
  if (!item) { res.status(404).json({ error: "Campaign not found" }); return; }
  const people = await audience(item.audience_filter);
  await pool.query("DELETE FROM campaign_recipients WHERE campaign_id=$1", [id]);
  for (const person of people) {
    const eligible = item.type === "email" ? Boolean(person.email) : Boolean(person.phone);
    await pool.query("INSERT INTO campaign_recipients (campaign_id,name,email,phone,status,error_msg) VALUES ($1,$2,$3,$4,$5,$6)",
      [id, person.name, person.email, person.phone, eligible ? "prepared" : "failed", eligible ? null : `Missing ${item.type === "email" ? "email" : "phone"}`]);
  }
  await pool.query("UPDATE campaigns SET status='scheduled', stats=$1::jsonb, updated_at=now() WHERE id=$2", [JSON.stringify({ total: people.length, prepared: people.filter((p) => item.type === "email" ? p.email : p.phone).length }), id]);
  req.log.info({ campaignId: id, recipientCount: people.length }, "Campaign recipients prepared without delivery");
  res.json({ campaignId: id, totalRecipients: people.length, delivery: "not_sent_no_provider" });
});
router.get("/admin/marketing/reports", async (req, res): Promise<void> => {
  if (!(await requireAdmin(req, res))) return;
  const [campaigns, recipients, events] = await Promise.all([
    pool.query("SELECT type,status,count(*)::int AS count FROM campaigns GROUP BY type,status"),
    pool.query("SELECT status,count(*)::int AS count FROM campaign_recipients GROUP BY status"),
    pool.query("SELECT channel,status,count(*)::int AS count FROM usage_events GROUP BY channel,status").catch(() => ({ rows: [] })),
  ]);
  res.json({ campaigns: campaigns.rows, recipients: recipients.rows, usageEvents: events.rows, deliveryProviderConfigured: false });
});
router.post("/admin/ai-studio/generate", async (req, res): Promise<void> => {
  if (!(await requireAdmin(req, res))) return;
  const prompt = typeof req.body?.prompt === "string" ? req.body.prompt.trim() : "";
  if (!prompt || prompt.length > 12000) { res.status(400).json({ error: "A prompt up to 12,000 characters is required" }); return; }
  if (!process.env.OPENAI_API_KEY) { res.status(503).json({ error: "AI Studio is not configured" }); return; }
  try {
    const response = await fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: "gpt-5-mini", input: prompt }) });
    if (!response.ok) { req.log.error({ status: response.status }, "OpenAI copy generation failed"); res.status(502).json({ error: "AI copy generation failed" }); return; }
    const data = await response.json() as {
      output_text?: string;
      output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
    };
    const copy = data.output_text
      ?? data.output
        ?.flatMap((item) => item.content ?? [])
        .filter((item) => item.type === "output_text" && typeof item.text === "string")
        .map((item) => item.text)
        .join("\n")
      ?? "";
    if (!copy.trim()) {
      req.log.error("OpenAI copy generation returned no text");
      res.status(502).json({ error: "AI copy generation returned no text" });
      return;
    }
    res.json({ copy });
  } catch (error) { req.log.error({ err: error }, "OpenAI copy generation request failed"); res.status(502).json({ error: "AI copy generation failed" }); }
});
export default router;