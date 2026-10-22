"use server";

import { z } from "zod";
import { apiConfigured, apiUrl } from "@/lib/api";

/**
 * Careers application → API (POST /api/jobs/:id/applications). The CV travels
 * base64-encoded; the API re-checks type, size and file signature, stores the
 * file and lists the application in the admin console's Job Applications page.
 */
const MAX_CV_BYTES = 5 * 1024 * 1024;
const CV_EXTENSIONS = ["pdf", "doc", "docx"];

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(120),
  email: z
    .string()
    .trim()
    .max(200)
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address."),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9().\-\s]{7,25}$/, "Enter a valid phone number, including country code.")
    .or(z.literal("")),
  coverLetter: z.string().trim().max(5000, "Keep the cover letter under 5,000 characters."),
});

type Field = keyof z.infer<typeof schema> | "cv";

export type ApplicationState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<Field, string>>;
  values?: Partial<Record<Exclude<Field, "cv">, string>>;
};

export async function submitApplication(jobId: number, _prev: ApplicationState, formData: FormData): Promise<ApplicationState> {
  // Same bot traps as the contact form: hidden honeypot + implausibly fast completion.
  if (String(formData.get("company_website") ?? "").trim()) return { status: "success" };
  const elapsed = Number(formData.get("elapsed_ms"));
  if (Number.isFinite(elapsed) && elapsed > 0 && elapsed < 3000) return { status: "success" };

  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    coverLetter: String(formData.get("coverLetter") ?? ""),
  };
  const values = raw;
  const fieldErrors: ApplicationState["fieldErrors"] = {};

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) fieldErrors[issue.path[0] as Field] ??= issue.message;
  }

  const cv = formData.get("cv");
  const ext = cv instanceof File ? cv.name.split(".").pop()?.toLowerCase() ?? "" : "";
  if (!(cv instanceof File) || cv.size === 0) fieldErrors.cv = "Attach your CV.";
  else if (!CV_EXTENSIONS.includes(ext)) fieldErrors.cv = "Upload a PDF, DOC or DOCX file.";
  else if (cv.size > MAX_CV_BYTES) fieldErrors.cv = "Your CV must be smaller than 5 MB.";

  if (!parsed.success || Object.keys(fieldErrors).length) {
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors, values };
  }

  if (!apiConfigured) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[careers] ASP_API_URL is not set — application NOT delivered (development only):", { jobId, ...parsed.data });
      return { status: "success", message: "Development mode: the application was logged because ASP_API_URL is not set." };
    }
    console.error("[careers] ASP_API_URL is not set — cannot deliver applications.");
    return { status: "error", message: "Applications are temporarily unavailable. Please try again later.", values };
  }

  const file = cv as File;
  try {
    const res = await fetch(apiUrl(`/jobs/${jobId}/applications`), {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        coverLetter: parsed.data.coverLetter || null,
        cv: { filename: file.name, data: Buffer.from(await file.arrayBuffer()).toString("base64") },
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) {
      const detail = (await res.json().catch(() => null)) as { error?: string } | null;
      console.error("[careers] API rejected application", res.status, detail);
      if (res.status === 413) return { status: "error", message: "Your CV is too large to upload. Please send a smaller file (under 5 MB).", values };
      return { status: "error", message: detail?.error ?? "We could not submit your application. Please try again.", values };
    }
    return { status: "success" };
  } catch (error) {
    console.error("[careers] API unreachable", error);
    return { status: "error", message: "We could not reach our servers. Please try again shortly.", values };
  }
}
