import { randomUUID } from "node:crypto";
import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { Router, type IRouter } from "express";
import { pool } from "@workspace/db";
import {
  ApplyToJobBody,
  ApplyToJobParams,
  ApplyToJobResponse,
  ListAdminJobApplicationsResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "./admin";
import { sendMail } from "../lib/mailer";

const router: IRouter = Router();

// CVs live on local disk: object storage only works on Replit. Point CV_UPLOAD_DIR
// somewhere outside the repo checkout on servers so deploys never touch it.
const cvDir = () => path.resolve(process.env.CV_UPLOAD_DIR ?? path.join(process.cwd(), "uploads", "cv"));
const LOCAL_PREFIX = "local:";
const MAX_CV_BYTES = 5 * 1024 * 1024;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?[0-9().\-\s]{7,25}$/;

// Checked against the file's first bytes, not just its name.
const cvTypes: Record<string, { mime: string; magic: number[] }> = {
  pdf: { mime: "application/pdf", magic: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  docx: { mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", magic: [0x50, 0x4b, 0x03, 0x04] }, // zip
  doc: { mime: "application/msword", magic: [0xd0, 0xcf, 0x11, 0xe0] }, // OLE2
};

const applyRequests = new Map<string, number[]>();
// In-memory sliding window: at most 5 applications per client per hour.
const applyThrottled = (key: string) => {
  const now = Date.now();
  const recent = (applyRequests.get(key) ?? []).filter((at) => now - at < 60 * 60000);
  recent.push(now);
  applyRequests.set(key, recent);
  return recent.length > 5;
};

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const safeFilename = (name: string) => name.replace(/[^\w.\- ()]+/g, "_").slice(0, 120) || "cv";

router.post("/jobs/:id/applications", async (req, res): Promise<void> => {
  const params = ApplyToJobParams.safeParse(req.params);
  const body = ApplyToJobBody.safeParse(req.body);
  if (!params.success || !body.success) { res.status(400).json({ error: "Please complete every required field and attach your CV." }); return; }
  if (applyThrottled(req.ip ?? "unknown")) { res.status(429).json({ error: "Too many applications from this connection. Please try again later." }); return; }

  const name = body.data.name.trim();
  const email = body.data.email.trim();
  const phone = body.data.phone?.trim() || null;
  const coverLetter = body.data.coverLetter?.trim() || null;
  if (name.length < 2 || !emailPattern.test(email) || (phone && !phonePattern.test(phone))) {
    res.status(400).json({ error: "Provide your name, a valid email and, if you add one, a valid phone number." });
    return;
  }

  const job = await pool.query<{ id: number; title: string }>(
    "SELECT id, title FROM jobs WHERE id = $1 AND is_active AND (closed_at IS NULL OR closed_at > now())",
    [params.data.id],
  );
  if (!job.rows[0]) { res.status(404).json({ error: "This role is no longer open." }); return; }

  const ext = path.extname(body.data.cv.filename).slice(1).toLowerCase();
  const type = cvTypes[ext];
  const bytes = Buffer.from(body.data.cv.data, "base64");
  if (!type) { res.status(400).json({ error: "Upload your CV as a PDF, DOC or DOCX file." }); return; }
  if (!bytes.length || bytes.length > MAX_CV_BYTES) { res.status(400).json({ error: "Your CV must be smaller than 5 MB." }); return; }
  if (!type.magic.every((b, i) => bytes[i] === b)) { res.status(400).json({ error: "That file doesn't look like a valid PDF or Word document." }); return; }

  const stored = `${randomUUID()}.${ext}`;
  await mkdir(cvDir(), { recursive: true });
  await writeFile(path.join(cvDir(), stored), bytes);

  const result = await pool.query<{ id: number; created_at: Date }>(
    `INSERT INTO job_applications (job_id, name, email, phone, cover_letter, cv_object_path, cv_filename, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'new') RETURNING id, created_at`,
    [job.rows[0].id, name, email, phone, coverLetter, `${LOCAL_PREFIX}${stored}`, safeFilename(body.data.cv.filename)],
  );
  const application = result.rows[0];
  req.log.info({ applicationId: application.id, jobId: job.rows[0].id }, "Job application received");

  // Best effort: tell the team, using the site's contact email and the SMTP settings.
  void (async () => {
    try {
      const settings = await pool.query<{ contact_email: string | null }>("SELECT contact_email FROM site_settings ORDER BY id ASC LIMIT 1");
      const to = settings.rows[0]?.contact_email;
      if (!to) return;
      await sendMail({
        to,
        subject: `New application: ${job.rows[0].title} — ${name}`,
        text: `${name} <${email}>${phone ? `, ${phone}` : ""} applied for ${job.rows[0].title}.\n\nReview it in the admin console under Job Applications.`,
        html: `<p><strong>${escapeHtml(name)}</strong> &lt;${escapeHtml(email)}&gt;${phone ? `, ${escapeHtml(phone)}` : ""} applied for <strong>${escapeHtml(job.rows[0].title)}</strong>.</p><p>Review it in the admin console under <em>Job Applications</em>.</p>`,
      });
    } catch (error) {
      req.log.warn({ err: error }, "Could not send new-application notification");
    }
  })();

  res.status(201).json(ApplyToJobResponse.parse({ id: application.id, createdAt: application.created_at }));
});

router.get("/admin/applications", async (req, res): Promise<void> => {
  if (!(await requireAdmin(req, res))) return;
  const [applications, legacy] = await Promise.all([
    pool.query(`
      SELECT a.id, a.job_id AS "jobId", j.title AS "jobTitle", a.name, a.email, a.phone,
             a.cover_letter AS "coverLetter", a.cv_filename AS "cvFilename",
             (a.cv_object_path IS NOT NULL) AS "hasCv", a.status, a.notes, a.created_at AS "createdAt"
      FROM job_applications a LEFT JOIN jobs j ON j.id = a.job_id
      ORDER BY a.created_at DESC LIMIT 1000`),
    // Before the careers form existed, "Apply" opened the contact form with this prefix.
    pool.query(`
      SELECT id, name, email, phone, message, created_at AS "createdAt"
      FROM contact_inquiries WHERE message ILIKE 'Application:%'
      ORDER BY created_at DESC LIMIT 500`),
  ]);
  res.json(ListAdminJobApplicationsResponse.parse({ applications: applications.rows, contactApplications: legacy.rows }));
});

// Plain download link (cookie-authenticated), so it isn't part of the generated client.
router.get("/admin/applications/:id/cv", async (req, res): Promise<void> => {
  if (!(await requireAdmin(req, res))) return;
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) { res.status(400).json({ error: "Invalid application" }); return; }
  const result = await pool.query<{ cv_object_path: string | null; cv_filename: string | null; name: string }>(
    "SELECT cv_object_path, cv_filename, name FROM job_applications WHERE id = $1",
    [id],
  );
  const row = result.rows[0];
  if (!row?.cv_object_path?.startsWith(LOCAL_PREFIX)) { res.status(404).json({ error: "No CV file is stored for this application" }); return; }
  // basename() keeps the lookup inside the CV folder whatever the column holds.
  const file = path.join(cvDir(), path.basename(row.cv_object_path.slice(LOCAL_PREFIX.length)));
  try {
    await stat(file);
  } catch {
    res.status(404).json({ error: "The CV file is missing on the server" });
    return;
  }
  const ext = path.extname(file).slice(1).toLowerCase();
  res.setHeader("Content-Type", cvTypes[ext]?.mime ?? "application/octet-stream");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.attachment(row.cv_filename || `${safeFilename(row.name)}-cv.${ext}`);
  res.sendFile(file);
});

export default router;
