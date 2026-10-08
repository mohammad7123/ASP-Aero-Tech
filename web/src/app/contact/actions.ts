"use server";

import { z } from "zod";
import { apiConfigured, apiUrl } from "@/lib/api";

/**
 * Contact form → existing API (POST /api/inquiries), so enquiries keep landing
 * in the admin console's Inquiries list exactly as before. Validation mirrors
 * the API's own rules (artifacts/api-server/src/routes/inquiries.ts).
 */
const schema = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(120),
  email: z
    .string()
    .trim()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address."),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9().\-\s]{7,25}$/, "Enter a valid phone number, including country code."),
  organization: z.string().trim().max(160).optional(),
  interest: z.string().trim().min(1, "Select an area of interest."),
  message: z.string().trim().min(10, "Tell us a little more (at least 10 characters).").max(5000),
  marketingConsent: z.boolean(),
});

type Field = keyof z.infer<typeof schema>;

export type InquiryState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<Field, string>>;
  values?: Partial<Record<Field, string>>;
};

export async function submitInquiry(_prev: InquiryState, formData: FormData): Promise<InquiryState> {
  // Bot traps: a hidden honeypot field, and a form completed implausibly fast
  // (elapsed time is measured client-side, so clock skew can't drop real leads).
  if (String(formData.get("company_website") ?? "").trim()) return { status: "success" };
  const elapsed = Number(formData.get("elapsed_ms"));
  if (Number.isFinite(elapsed) && elapsed > 0 && elapsed < 2500) return { status: "success" };

  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    organization: String(formData.get("organization") ?? "") || undefined,
    interest: String(formData.get("interest") ?? ""),
    message: String(formData.get("message") ?? ""),
    marketingConsent: formData.get("marketingConsent") === "on",
  };
  const values = { ...raw, organization: raw.organization ?? "", marketingConsent: raw.marketingConsent ? "on" : "" };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: InquiryState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as Field;
      fieldErrors[key] ??= issue.message;
    }
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors, values };
  }

  if (!apiConfigured) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[contact] ASP_API_URL is not set — inquiry NOT delivered (development only):", parsed.data);
      return { status: "success", message: "Development mode: the inquiry was logged to the server console because ASP_API_URL is not set." };
    }
    console.error("[contact] ASP_API_URL is not set — cannot deliver inquiries.");
    return { status: "error", message: "Our enquiry system is temporarily unavailable. Please email or call us directly.", values };
  }

  try {
    const res = await fetch(apiUrl("/inquiries"), {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error("[contact] API rejected inquiry", res.status, await res.text().catch(() => ""));
      return { status: "error", message: "We could not send your message. Please check your details and try again.", values };
    }
    return { status: "success" };
  } catch (error) {
    console.error("[contact] API unreachable", error);
    return { status: "error", message: "We could not reach our servers. Please try again shortly, or contact us directly.", values };
  }
}
