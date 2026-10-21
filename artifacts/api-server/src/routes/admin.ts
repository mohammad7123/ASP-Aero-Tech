import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { Router, type IRouter, type Request, type Response } from "express";
import { pool } from "@workspace/db";
import {
  AdminLoginBody,
  AdminLoginResponse,
  ChangeAdminPasswordBody,
  ChangeAdminPasswordResponse,
  CreateAdminResourceBody,
  CreateAdminResourceParams,
  CreateAdminResourceResponse,
  DeleteAdminResourceParams,
  GetAdminOverviewResponse,
  GetAdminSessionResponse,
  ListAdminResourceParams,
  ListAdminResourceQueryParams,
  ListAdminResourceResponse,
  RequestAdminPasswordResetBody,
  RequestAdminPasswordResetResponse,
  ResetAdminPasswordBody,
  ResetAdminPasswordResponse,
  SetupAdminBody,
  SetupAdminResponse,
  UpdateAdminAccountBody,
  UpdateAdminAccountResponse,
  UpdateAdminResourceBody,
  UpdateAdminResourceParams,
  UpdateAdminResourceResponse,
  VerifyAdminResetTokenQueryParams,
  VerifyAdminResetTokenResponse,
} from "@workspace/api-zod";
import { ObjectStorageService } from "../lib/objectStorage";
import { logger } from "../lib/logger";
import { sendMail } from "../lib/mailer";

type FieldType = "text" | "textarea" | "url" | "number" | "boolean" | "date" | "json";
type Field = { name: string; label: string; type: FieldType; required?: boolean; editable?: boolean };
type Resource = { table: string; label: string; fields: Field[]; search?: string[]; canCreate?: boolean; canDelete?: boolean };
type Admin = { id: number; username: string; email: string | null; role: string };
const productCategories = new Set([
  "Surveillance",
  "Photography & Videography",
  "Agriculture",
  "Delivery",
  "Mapping & Surveying",
  "Inspection",
  "Search & Rescue",
  "Military & Defense",
  "Recreational",
  "Racing",
]);

const f = (name: string, label: string, type: FieldType = "text", required = false, editable = true): Field =>
  ({ name, label, type, required, editable });
const audit = [f("created_at", "Created", "date", false, false), f("updated_at", "Updated", "date", false, false)];
const ordered = [f("sort_order", "Order", "number"), f("is_active", "Active", "boolean")];

const resources: Record<string, Resource> = {
  inquiries: { table: "contact_inquiries", label: "Contact inquiries", canCreate: false, search: ["name", "email", "phone", "interest", "organization", "subject"], fields: [f("id", "ID", "number", false, false), f("name", "Name", "text", true, false), f("email", "Email", "text", true, false), f("phone", "Phone", "text", true, false), f("interest", "Area of interest", "text", true, false), f("organization", "Organization", "text", false, false), f("marketing_consent", "Marketing consent", "boolean", false, false), f("subject", "Subject", "text", false, false), f("message", "Message", "textarea", false, false), f("is_read", "Read", "boolean"), f("created_at", "Received", "date", false, false)] },
  "hero-slides": { table: "hero_slides", label: "Hero slides", search: ["title", "subtitle"], fields: [f("id", "ID", "number", false, false), f("title", "Title", "text", true), f("subtitle", "Subtitle", "textarea"), f("image_url", "Image URL", "url", true), f("eyebrow", "Eyebrow"), f("badge", "Badge"), f("cta_text", "CTA text"), f("cta_url", "CTA URL", "url"), f("stat1", "Stat 1"), f("stat2", "Stat 2"), f("stat3", "Stat 3"), ...ordered, ...audit] },
  services: { table: "services", label: "Services", search: ["name", "slug", "category"], fields: [f("id", "ID", "number", false, false), f("name", "Name", "text", true), f("slug", "Slug", "text", true), f("category", "Category", "text", true), f("short_desc", "Summary", "textarea", true), f("description", "Description", "textarea"), f("image_url", "Image URL", "url"), f("icon_name", "Icon"), f("accent_color", "Accent color"), ...ordered, ...audit] },
  products: { table: "product_items", label: "Products", search: ["name", "slug", "category"], fields: [f("id", "ID", "number", false, false), f("category", "Primary category", "text", true, false), f("name", "Name", "text", true), f("slug", "URL slug", "text", true), f("short_desc", "Summary", "textarea", true), f("description", "Description", "textarea"), f("image_url", "Image", "url"), f("categories", "Mission categories", "json", true), f("specs", "Technical specifications", "json"), f("features", "Features", "json"), f("icon_name", "Icon"), f("accent_color", "Accent color"), ...ordered, ...audit] },
  industries: { table: "industries", label: "Industries", search: ["name", "slug"], fields: [f("id", "ID", "number", false, false), f("name", "Name", "text", true), f("slug", "Slug", "text", true), f("short_desc", "Summary", "textarea", true), f("description", "Description", "textarea"), f("image_url", "Image URL", "url"), f("icon_name", "Icon"), f("accent_color", "Accent color"), ...ordered, ...audit] },
  pages: { table: "pages", label: "Pages", search: ["title", "slug"], fields: [f("id", "ID", "number", false, false), f("title", "Title", "text", true), f("slug", "Slug", "text", true), f("content", "Content", "textarea", true), f("meta_title", "Meta title"), f("meta_description", "Meta description", "textarea"), f("hero_image", "Hero image", "url"), f("is_published", "Published", "boolean"), f("sort_order", "Order", "number"), ...audit] },
  "content-blocks": { table: "page_content_blocks", label: "Content blocks", search: ["page_slug", "block_key", "value"], fields: [f("id", "ID", "number", false, false), f("page_slug", "Page slug", "text", true), f("block_key", "Block key", "text", true), f("value", "Value", "textarea", true), f("updated_at", "Updated", "date", false, false)] },
  portfolio: { table: "portfolio", label: "Portfolio", search: ["title", "slug", "client_name"], fields: [f("id", "ID", "number", false, false), f("title", "Title", "text", true), f("slug", "Slug", "text", true), f("description", "Summary", "textarea"), f("content", "Content", "textarea", true), f("featured_image", "Featured image", "url"), f("client_name", "Client"), f("project_url", "Project URL", "url"), f("technologies", "Technologies"), f("is_published", "Published", "boolean"), f("sort_order", "Order", "number"), f("completed_at", "Completed", "date"), ...audit] },
  clients: { table: "clients", label: "Clients", search: ["name", "industry"], fields: [f("id", "ID", "number", false, false), f("name", "Name", "text", true), f("logo_url", "Logo URL", "url"), f("website_url", "Website URL", "url"), f("industry", "Industry"), f("testimonial", "Testimonial", "textarea"), f("testimonial_person", "Person"), f("testimonial_role", "Role"), ...ordered, ...audit] },
  jobs: { table: "jobs", label: "Jobs", search: ["title", "department", "location"], fields: [f("id", "ID", "number", false, false), f("title", "Title", "text", true), f("department", "Department", "text", true), f("location", "Location", "text", true), f("type", "Type", "text", true), f("description", "Description", "textarea", true), f("requirements", "Requirements", "textarea", true), f("salary_range", "Salary range"), f("is_active", "Active", "boolean"), f("sort_order", "Order", "number"), f("closed_at", "Closed", "date"), ...audit] },
  applications: { table: "job_applications", label: "Job applications", canCreate: false, search: ["name", "email", "status"], fields: [f("id", "ID", "number", false, false), f("job_id", "Job ID", "number", true, false), f("name", "Name", "text", true, false), f("email", "Email", "text", true, false), f("phone", "Phone", "text", false, false), f("cover_letter", "Cover letter", "textarea", false, false), f("cv_filename", "CV file", "text", false, false), f("status", "Status"), f("notes", "Notes", "textarea"), ...audit] },
  "blog-categories": { table: "blog_categories", label: "Blog categories", search: ["name", "slug"], fields: [f("id", "ID", "number", false, false), f("name", "Name", "text", true), f("slug", "Slug", "text", true), f("created_at", "Created", "date", false, false)] },
  "blog-posts": { table: "blog_posts", label: "Blog posts", search: ["title", "slug", "excerpt"], fields: [f("id", "ID", "number", false, false), f("title", "Title", "text", true), f("slug", "Slug", "text", true), f("excerpt", "Excerpt", "textarea"), f("content", "Content", "textarea", true), f("featured_image", "Featured image", "url"), f("category_id", "Category ID", "number"), f("is_published", "Published", "boolean"), f("meta_title", "Meta title"), f("meta_description", "Meta description", "textarea"), f("published_at", "Published at", "date"), ...audit] },
  campaigns: { table: "campaigns", label: "Campaigns", search: ["name", "type", "status"], fields: [f("id", "ID", "number", false, false), f("name", "Name", "text", true), f("type", "Type", "text", true), f("subject", "Subject"), f("body", "Body", "textarea", true), f("status", "Status"), f("audience_filter", "Audience filter", "json"), f("stats", "Stats", "json"), f("sent_at", "Sent", "date"), ...audit] },
  "menu-items": { table: "menu_items", label: "Menu items", search: ["label", "url"], fields: [f("id", "ID", "number", false, false), f("label", "Label", "text", true), f("url", "URL", "text", true), f("page_id", "Page ID", "number"), f("sort_order", "Order", "number"), f("open_in_new_tab", "New tab", "boolean"), f("is_visible", "Visible", "boolean"), ...audit] },
  media: { table: "media", label: "Media", search: ["filename", "alt_text"], fields: [f("id", "ID", "number", false, false), f("filename", "Filename", "text", true), f("object_path", "Object path", "text", true), f("mime_type", "MIME type"), f("size", "Size", "number"), f("alt_text", "Alt text"), f("created_at", "Created", "date", false, false)] },
  settings: { table: "site_settings", label: "Site settings", canDelete: false, search: ["site_name", "tagline"], fields: [f("id", "ID", "number", false, false), f("site_name", "Site name", "text", true), f("tagline", "Tagline"), f("logo_url", "Logo URL", "url"), f("favicon_url", "Favicon URL", "url"), f("contact_email", "Contact email"), f("contact_phone", "Contact phone"), f("contact_phone2", "Alternate phone"), f("address", "Address", "textarea"), f("whatsapp_number", "WhatsApp"), f("whatsapp_greeting", "WhatsApp greeting", "textarea"), f("linkedin_url", "LinkedIn", "url"), f("twitter_url", "X / Twitter", "url"), f("facebook_url", "Facebook", "url"), f("instagram_url", "Instagram", "url"), f("youtube_url", "YouTube", "url"), f("primary_color", "Primary color"), f("accent_color", "Accent color"), f("background_color", "Background color"), f("font_family", "Font family"), f("chatbot_name", "Chatbot name"), f("chatbot_greeting", "Chatbot greeting", "textarea"), f("chatbot_enabled", "Chatbot enabled", "boolean"), f("banner_height", "Banner height", "number"), f("banner_speed", "Banner speed", "number"), f("updated_at", "Updated", "date", false, false)] },
};

const router: IRouter = Router();
const objectStorage = new ObjectStorageService();
const cookieName = "asp_admin_session";
const secret = () => {
  if (!process.env.SESSION_SECRET) throw new Error("SESSION_SECRET is required");
  return process.env.SESSION_SECRET;
};
const sign = (value: string) => createHmac("sha256", secret()).update(value).digest("base64url");
type AdminRow = Admin & { password_hash: string };
const adminColumns = "id, username, email, role, password_hash";
const publicAdmin = ({ password_hash: _hash, ...admin }: AdminRow): Admin => admin;
// The signature covers the password hash, so changing or resetting a password signs out every other session.
const makeToken = (admin: AdminRow) => {
  const payload = `${admin.id}.${Date.now() + 7 * 86400000}`;
  return `${payload}.${sign(`${payload}.${admin.password_hash}`)}`;
};
const readAdmin = async (req: Request): Promise<Admin | null> => {
  const token = req.cookies?.[cookieName] as string | undefined;
  if (!token) return null;
  const [id, expires, signature] = token.split(".");
  if (!id || !expires || !signature || !Number.isInteger(Number(id)) || Number(expires) < Date.now()) return null;
  const result = await pool.query<AdminRow>(`SELECT ${adminColumns} FROM admin_users WHERE id = $1`, [Number(id)]);
  const admin = result.rows[0];
  if (!admin) return null;
  const expected = sign(`${id}.${expires}.${admin.password_hash}`);
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  return publicAdmin(admin);
};
export const requireAdmin = async (req: Request, res: Response) => {
  const admin = await readAdmin(req);
  if (!admin) res.status(401).json({ error: "Authentication required" });
  return admin;
};
const setSession = (res: Response, admin: AdminRow) =>
  res.cookie(cookieName, makeToken(admin), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 7 * 86400000, path: "/" });
const isProduction = () => process.env.NODE_ENV === "production";
/** The admin/admin test account is seeded outside production, or anywhere ADMIN_TEST_LOGIN=true. ADMIN_TEST_LOGIN=false turns it off. */
export const testLoginEnabled = () =>
  process.env.ADMIN_TEST_LOGIN === "true" || (!isProduction() && process.env.ADMIN_TEST_LOGIN !== "false");
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
const resetTtlMinutes = 30;
const resetRequests = new Map<string, number[]>();
// In-memory sliding window: at most 5 reset requests per client per 15 minutes.
const resetThrottled = (key: string) => {
  const now = Date.now();
  const recent = (resetRequests.get(key) ?? []).filter((at) => now - at < 15 * 60000);
  recent.push(now);
  resetRequests.set(key, recent);
  return recent.length > 5;
};
// ADMIN_APP_URL pins the link origin in production so a forged Origin header cannot redirect reset emails.
const appUrl = (req: Request) =>
  (process.env.ADMIN_APP_URL ?? req.get("origin") ?? `${req.protocol}://${req.get("host")}`).replace(/\/+$/, "");
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const hashPassword = (password: string) => {
  const salt = randomBytes(16).toString("hex");
  return `scrypt$${salt}$${scryptSync(password, salt, 64).toString("hex")}`;
};
const verifyPassword = (password: string, stored: string) => {
  const [kind, salt, digest] = stored.split("$");
  if (kind !== "scrypt" || !salt || !digest) return false;
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(digest, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
};
const selected = (r: Resource) => r.fields.map((x) => `"${x.name}"`).join(", ");
const parseValues = (r: Resource, input: Record<string, unknown>, create: boolean) => {
  const values: Record<string, unknown> = {};
  for (const field of r.fields.filter((x) => x.editable !== false)) {
    const value = input[field.name];
    if (value === undefined || value === "") {
      if (create && field.required) throw new Error(`${field.label} is required`);
      if (value === "") values[field.name] = null;
      continue;
    }
    if (field.type === "number") {
      const number = Number(value);
      if (!Number.isFinite(number)) throw new Error(`${field.label} must be a number`);
      values[field.name] = number;
    } else if (field.type === "boolean") values[field.name] = value === true || value === "true";
    else if (field.type === "json") values[field.name] = typeof value === "string" ? JSON.parse(value) : value;
    else if (field.type === "date") values[field.name] = value ? new Date(String(value)) : null;
    else values[field.name] = value;
  }
  if (r.table === "product_items") {
    const categories = values.categories;
    if (
      !Array.isArray(categories) ||
      categories.length === 0 ||
      categories.some((category) => typeof category !== "string" || !productCategories.has(category))
    ) {
      throw new Error("At least one mission category is required");
    }
    values.category = String(categories[0]);
  }
  return values;
};
const cleanupUnreferencedProductImage = async (req: Request, imagePath: unknown) => {
  if (typeof imagePath !== "string" || !imagePath.trim()) return;

  try {
    const normalizedPath = objectStorage.normalizeObjectEntityPath(imagePath);
    if (!normalizedPath.startsWith("/objects/")) return;

    const references = await pool.query<{ image_url: string | null }>(
      "SELECT image_url FROM product_items WHERE image_url IS NOT NULL",
    );
    const stillReferenced = references.rows.some(
      (row) => typeof row.image_url === "string" && objectStorage.normalizeObjectEntityPath(row.image_url) === normalizedPath,
    );
    if (stillReferenced) return;

    await objectStorage.deleteObjectEntity(normalizedPath);
  } catch (error) {
    req.log.error({ err: error, objectPath: imagePath }, "Failed to clean up unreferenced product image");
  }
};

/** Creates the password-reset table and, when enabled, the admin/admin test account. Runs once at startup. */
export async function ensureAdminAuth() {
  await pool.query(`CREATE TABLE IF NOT EXISTS admin_password_resets (
    id serial PRIMARY KEY,
    admin_id integer NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    token_hash text NOT NULL UNIQUE,
    expires_at timestamptz NOT NULL,
    used_at timestamptz,
    requested_ip text,
    created_at timestamptz NOT NULL DEFAULT now()
  )`);
  if (!testLoginEnabled()) return;
  const existing = await pool.query<AdminRow>(`SELECT ${adminColumns} FROM admin_users WHERE username = 'admin'`);
  const current = existing.rows[0];
  // Only rewrite the hash when it no longer matches, so restarts keep existing test sessions valid.
  if (!current) {
    await pool.query("INSERT INTO admin_users (username, password_hash, role) VALUES ('admin', $1, 'admin')", [hashPassword("admin")]);
  } else if (!verifyPassword("admin", current.password_hash) || current.role !== "admin") {
    await pool.query("UPDATE admin_users SET password_hash = $1, role = 'admin', updated_at = now() WHERE id = $2", [hashPassword("admin"), current.id]);
  }
  logger.warn("Admin test login enabled: username 'admin', password 'admin'. Set ADMIN_TEST_LOGIN=false to disable.");
}

router.get("/admin/session", async (req, res): Promise<void> => {
  const admin = await readAdmin(req);
  const count = await pool.query<{ count: number }>("SELECT COUNT(*)::int AS count FROM admin_users");
  res.json(GetAdminSessionResponse.parse({
    authenticated: Boolean(admin),
    admin,
    setupAvailable: count.rows[0].count === 0,
    testLoginEnabled: testLoginEnabled(),
  }));
});
router.post("/admin/setup", async (req, res): Promise<void> => {
  const body = SetupAdminBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }
  const count = await pool.query("SELECT COUNT(*)::int AS count FROM admin_users");
  if (count.rows[0].count > 0) { res.status(409).json({ error: "Administrator setup is already complete" }); return; }
  const result = await pool.query<AdminRow>(`INSERT INTO admin_users (username, password_hash, email, role) VALUES ($1,$2,$3,'admin') RETURNING ${adminColumns}`, [body.data.username, hashPassword(body.data.password), body.data.email ?? null]);
  setSession(res, result.rows[0]);
  res.status(201).json(SetupAdminResponse.parse({ admin: publicAdmin(result.rows[0]) }));
});
router.post("/admin/login", async (req, res): Promise<void> => {
  const body = AdminLoginBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }
  const result = await pool.query<AdminRow>(`SELECT ${adminColumns} FROM admin_users WHERE username = $1`, [body.data.username]);
  const admin = result.rows[0];
  if (!admin || !verifyPassword(body.data.password, admin.password_hash)) { res.status(401).json({ error: "Invalid username or password" }); return; }
  setSession(res, admin);
  res.json(AdminLoginResponse.parse({ admin: publicAdmin(admin) }));
});
router.post("/admin/logout", (_req, res): void => {
  res.clearCookie(cookieName, { path: "/" });
  res.sendStatus(204);
});
router.post("/admin/password/forgot", async (req, res): Promise<void> => {
  const body = RequestAdminPasswordResetBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Enter your username or recovery email" }); return; }
  if (resetThrottled(req.ip ?? "unknown")) { res.status(429).json({ error: "Too many reset requests. Try again in 15 minutes." }); return; }
  const identifier = body.data.identifier.trim();
  const result = await pool.query<AdminRow>(
    `SELECT ${adminColumns} FROM admin_users WHERE username = $1 OR lower(email) = lower($1) ORDER BY (username = $1) DESC LIMIT 1`,
    [identifier],
  );
  const admin = result.rows[0];
  let devResetUrl: string | null = null;
  if (admin) {
    const token = randomBytes(32).toString("base64url");
    await pool.query("UPDATE admin_password_resets SET used_at = now() WHERE admin_id = $1 AND used_at IS NULL", [admin.id]);
    await pool.query(
      `INSERT INTO admin_password_resets (admin_id, token_hash, expires_at, requested_ip) VALUES ($1, $2, now() + interval '${resetTtlMinutes} minutes', $3)`,
      [admin.id, hashToken(token), req.ip ?? null],
    );
    const resetUrl = `${appUrl(req)}/admin/reset-password?token=${token}`;
    let emailed = false;
    if (admin.email) {
      try {
        emailed = await sendMail({
          to: admin.email,
          subject: "Reset your ASP Aero Tech admin password",
          text: `Hi ${admin.username},\n\nUse this link to choose a new admin password. It expires in ${resetTtlMinutes} minutes and works once:\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email; your password will not change.`,
          html: `<p>Hi ${escapeHtml(admin.username)},</p><p>Use the button below to choose a new admin password. It expires in ${resetTtlMinutes} minutes and works once.</p><p><a href="${resetUrl}" style="display:inline-block;padding:12px 20px;background:#0B203D;color:#fff;text-decoration:none;border-radius:6px;font-weight:600">Reset password</a></p><p style="color:#64748b;font-size:13px">If you did not request this, you can ignore this email; your password will not change.</p>`,
        });
      } catch (error) {
        req.log.error({ err: error }, "Failed to send password reset email");
      }
    }
    if (!emailed) req.log.warn({ adminId: admin.id, hasEmail: Boolean(admin.email) }, "Password reset email not sent: no recovery email or SMTP is not configured");
    if (!isProduction()) {
      devResetUrl = resetUrl;
      req.log.info({ resetUrl }, "Password reset link (development only)");
    }
  }
  res.status(202).json(RequestAdminPasswordResetResponse.parse({
    message: `If an administrator matches that username or email, a reset link is on its way. It expires in ${resetTtlMinutes} minutes.`,
    devResetUrl,
  }));
});
router.get("/admin/password/reset", async (req, res): Promise<void> => {
  const query = VerifyAdminResetTokenQueryParams.safeParse(req.query);
  if (!query.success) { res.json(VerifyAdminResetTokenResponse.parse({ valid: false, username: null, expiresAt: null })); return; }
  const result = await pool.query<{ username: string; expires_at: Date }>(
    `SELECT u.username, r.expires_at FROM admin_password_resets r JOIN admin_users u ON u.id = r.admin_id
     WHERE r.token_hash = $1 AND r.used_at IS NULL AND r.expires_at > now()`,
    [hashToken(query.data.token)],
  );
  const row = result.rows[0];
  res.json(VerifyAdminResetTokenResponse.parse({ valid: Boolean(row), username: row?.username ?? null, expiresAt: row?.expires_at ?? null }));
});
router.post("/admin/password/reset", async (req, res): Promise<void> => {
  const body = ResetAdminPasswordBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Choose a password with at least 8 characters" }); return; }
  // Consuming the token in the same statement that checks it makes each link single-use, even under concurrent requests.
  const consumed = await pool.query<{ admin_id: number }>(
    "UPDATE admin_password_resets SET used_at = now() WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now() RETURNING admin_id",
    [hashToken(body.data.token)],
  );
  const adminId = consumed.rows[0]?.admin_id;
  if (!adminId) { res.status(400).json({ error: "This reset link is invalid or has expired. Request a new one." }); return; }
  const updated = await pool.query<AdminRow>(
    `UPDATE admin_users SET password_hash = $1, updated_at = now() WHERE id = $2 RETURNING ${adminColumns}`,
    [hashPassword(body.data.password), adminId],
  );
  await pool.query("UPDATE admin_password_resets SET used_at = now() WHERE admin_id = $1 AND used_at IS NULL", [adminId]);
  setSession(res, updated.rows[0]);
  req.log.info({ adminId }, "Admin password reset");
  res.json(ResetAdminPasswordResponse.parse({ admin: publicAdmin(updated.rows[0]) }));
});
router.post("/admin/password/change", async (req, res): Promise<void> => {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  const body = ChangeAdminPasswordBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Choose a new password with at least 8 characters" }); return; }
  const current = await pool.query<AdminRow>(`SELECT ${adminColumns} FROM admin_users WHERE id = $1`, [admin.id]);
  if (!current.rows[0] || !verifyPassword(body.data.currentPassword, current.rows[0].password_hash)) {
    res.status(400).json({ error: "Your current password is incorrect" }); return;
  }
  if (body.data.currentPassword === body.data.newPassword) { res.status(400).json({ error: "The new password must be different from the current one" }); return; }
  const updated = await pool.query<AdminRow>(
    `UPDATE admin_users SET password_hash = $1, updated_at = now() WHERE id = $2 RETURNING ${adminColumns}`,
    [hashPassword(body.data.newPassword), admin.id],
  );
  await pool.query("UPDATE admin_password_resets SET used_at = now() WHERE admin_id = $1 AND used_at IS NULL", [admin.id]);
  setSession(res, updated.rows[0]);
  res.json(ChangeAdminPasswordResponse.parse({ admin: publicAdmin(updated.rows[0]) }));
});
router.patch("/admin/account", async (req, res): Promise<void> => {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  const body = UpdateAdminAccountBody.safeParse(req.body);
  const email = body.success ? body.data.email?.trim() || null : undefined;
  if (email === undefined || (email && !emailPattern.test(email))) { res.status(400).json({ error: "Enter a valid email address" }); return; }
  const updated = await pool.query<Admin>("UPDATE admin_users SET email = $1, updated_at = now() WHERE id = $2 RETURNING id, username, email, role", [email, admin.id]);
  res.json(UpdateAdminAccountResponse.parse({ admin: updated.rows[0] }));
});
router.get("/admin/overview", async (req, res): Promise<void> => {
  if (!(await requireAdmin(req, res))) return;
  const result = await pool.query(`SELECT
    (SELECT count(*)::int FROM contact_inquiries) AS "inquiriesTotal",
    (SELECT count(*)::int FROM contact_inquiries WHERE NOT is_read) AS "unreadInquiries",
    (SELECT count(*)::int FROM pages WHERE is_published) AS "publishedPages",
    (SELECT count(*)::int FROM services WHERE is_active) AS "activeServices",
    (SELECT count(*)::int FROM product_items WHERE is_active) AS "activeProducts",
    (SELECT count(*)::int FROM jobs WHERE is_active) AS "openJobs",
    (SELECT count(*)::int FROM blog_posts WHERE is_published) AS "publishedPosts"`);
  const recent = await pool.query("SELECT id, name, email, phone, interest, organization, marketing_consent, subject, is_read, created_at FROM contact_inquiries ORDER BY created_at DESC LIMIT 5");
  res.json(GetAdminOverviewResponse.parse({ ...result.rows[0], recentInquiries: recent.rows }));
});
router.get("/admin/resources/:resource", async (req, res): Promise<void> => {
  if (!(await requireAdmin(req, res))) return;
  const params = ListAdminResourceParams.safeParse(req.params);
  const query = ListAdminResourceQueryParams.safeParse(req.query);
  if (!params.success || !query.success) { res.status(400).json({ error: "Invalid resource request" }); return; }
  const resource = resources[params.data.resource];
  if (!resource) { res.status(404).json({ error: "Unknown resource" }); return; }
  const search = query.data.search?.trim();
  const where = search && resource.search?.length ? ` WHERE ${resource.search.map((c) => `"${c}"::text ILIKE $1`).join(" OR ")}` : "";
  const args = where ? [`%${search}%`] : [];
  const [rows, count] = await Promise.all([
    pool.query(`SELECT ${selected(resource)} FROM "${resource.table}"${where} ORDER BY id DESC LIMIT 250`, args),
    pool.query(`SELECT count(*)::int AS total FROM "${resource.table}"${where}`, args),
  ]);
  res.json(ListAdminResourceResponse.parse({ resource: params.data.resource, label: resource.label, fields: resource.fields.map((x) => ({ ...x, required: Boolean(x.required), editable: x.editable !== false })), rows: rows.rows, total: count.rows[0].total }));
});
router.post("/admin/resources/:resource", async (req, res): Promise<void> => {
  if (!(await requireAdmin(req, res))) return;
  const params = CreateAdminResourceParams.safeParse(req.params);
  const body = CreateAdminResourceBody.safeParse(req.body);
  if (!params.success || !body.success) { res.status(400).json({ error: "Invalid resource data" }); return; }
  const resource = resources[params.data.resource];
  if (!resource) { res.status(404).json({ error: "Unknown resource" }); return; }
  if (resource.canCreate === false) { res.status(400).json({ error: "This resource cannot be created manually" }); return; }
  try {
    const values = parseValues(resource, body.data.values, true);
    const names = Object.keys(values);
    const result = await pool.query(`INSERT INTO "${resource.table}" (${names.map((n) => `"${n}"`).join(",")}) VALUES (${names.map((_, i) => `$${i + 1}`).join(",")}) RETURNING ${selected(resource)}`, Object.values(values));
    res.status(201).json(CreateAdminResourceResponse.parse({ resource: params.data.resource, row: result.rows[0] }));
  } catch (error) { res.status(400).json({ error: error instanceof Error ? error.message : "Invalid resource data" }); }
});
router.patch("/admin/resources/:resource/:id", async (req, res): Promise<void> => {
  if (!(await requireAdmin(req, res))) return;
  const params = UpdateAdminResourceParams.safeParse(req.params);
  const body = UpdateAdminResourceBody.safeParse(req.body);
  if (!params.success || !body.success) { res.status(400).json({ error: "Invalid resource data" }); return; }
  const resource = resources[params.data.resource];
  if (!resource) { res.status(404).json({ error: "Unknown resource" }); return; }
  try {
    const values = parseValues(resource, body.data.values, false);
    const entries = Object.entries(values);
    if (!entries.length) { res.status(400).json({ error: "No editable values supplied" }); return; }
    const previousImagePath = resource.table === "product_items" && Object.prototype.hasOwnProperty.call(values, "image_url")
      ? (await pool.query<{ image_url: string | null }>("SELECT image_url FROM product_items WHERE id=$1", [params.data.id])).rows[0]?.image_url
      : null;
    const result = await pool.query(`UPDATE "${resource.table}" SET ${entries.map(([n], i) => `"${n}"=$${i + 1}`).join(",")}${resource.fields.some((x) => x.name === "updated_at") ? ", updated_at=now()" : ""} WHERE id=$${entries.length + 1} RETURNING ${selected(resource)}`, [...entries.map(([, v]) => v), params.data.id]);
    if (!result.rows[0]) { res.status(404).json({ error: "Record not found" }); return; }
    if (resource.table === "product_items" && previousImagePath && previousImagePath !== values.image_url) {
      await cleanupUnreferencedProductImage(req, previousImagePath);
    }
    res.json(UpdateAdminResourceResponse.parse({ resource: params.data.resource, row: result.rows[0] }));
  } catch (error) { res.status(400).json({ error: error instanceof Error ? error.message : "Invalid resource data" }); }
});
router.delete("/admin/resources/:resource/:id", async (req, res): Promise<void> => {
  if (!(await requireAdmin(req, res))) return;
  const params = DeleteAdminResourceParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid record" }); return; }
  const resource = resources[params.data.resource];
  if (!resource) { res.status(404).json({ error: "Unknown resource" }); return; }
  if (resource.canDelete === false) { res.status(400).json({ error: "This resource cannot be deleted" }); return; }
  const returning = resource.table === "product_items" ? "id, image_url" : "id";
  const result = await pool.query(`DELETE FROM "${resource.table}" WHERE id=$1 RETURNING ${returning}`, [params.data.id]);
  if (!result.rows[0]) { res.status(404).json({ error: "Record not found" }); return; }
  if (resource.table === "product_items") {
    await cleanupUnreferencedProductImage(req, result.rows[0].image_url);
  }
  res.sendStatus(204);
});

export default router;