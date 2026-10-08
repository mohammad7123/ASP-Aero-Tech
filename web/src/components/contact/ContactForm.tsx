"use client";

import { ArrowUpRight, CheckCircle2, Loader2 } from "lucide-react";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { submitInquiry, type InquiryState } from "@/app/contact/actions";
import { inquiryInterests } from "@/content/site";
import { useClientValue } from "@/lib/hooks";
import { cn } from "@/lib/utils";

type ProductOption = { slug: string; name: string };
type Prefill = { interest: string; message: string };

/** ?interest=, ?platform= and ?role= query parameters → initial field values. */
function prefillFrom(search: string, products: ProductOption[]): Prefill {
  const q = new URLSearchParams(search);
  const role = q.get("role");
  if (role) return { interest: "other", message: `Application: ${role.slice(0, 120)}. ` };
  const wanted = q.get("interest") ?? "";
  const platform = products.find((p) => p.slug === q.get("platform"));
  return {
    interest: inquiryInterests.some((i) => i.value === wanted) ? wanted : "",
    message: platform ? `I'm interested in the ${platform.name}. ` : "",
  };
}

/**
 * Inquiry form (React 19 useActionState + Server Action). Works without
 * JavaScript too (progressive enhancement). Fields are uncontrolled: React
 * resets the form after each submission and restores defaults from state.
 */
export function ContactForm({ products }: { products: ProductOption[] }) {
  const [formKey, setFormKey] = useState(0);
  const search = useClientValue(() => window.location.search, "");
  const prefill = useMemo(() => prefillFrom(search, products), [search, products]);
  return <FormInner key={`${formKey}:${search}`} prefill={prefill} onReset={() => setFormKey((k) => k + 1)} />;
}

function FormInner({ prefill, onReset }: { prefill: Prefill; onReset: () => void }) {
  const [state, action, pending] = useActionState<InquiryState, FormData>(submitInquiry, { status: "idle" });
  const mountedAt = useRef(0);
  const elapsedRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (state.status !== "idle") statusRef.current?.focus();
  }, [state]);

  const err = state.fieldErrors ?? {};
  const v = state.values ?? {};

  if (state.status === "success") {
    return (
      <div ref={statusRef} tabIndex={-1} className="flex min-h-[420px] flex-col items-center justify-center text-center outline-none" role="status">
        <span className="grid size-16 place-items-center rounded-full border border-go/40 bg-go/10 text-go">
          <CheckCircle2 size={30} />
        </span>
        <h2 className="mt-6 text-3xl font-semibold">Requirement received.</h2>
        <p className="mt-3 max-w-sm text-fg-muted">{state.message ?? "Thank you. An ASP Aero Tech representative will review your enquiry and respond shortly."}</p>
        <button type="button" onClick={onReset} className="link-arrow mt-8">
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form
      action={action}
      onSubmit={() => {
        if (elapsedRef.current) elapsedRef.current.value = String(Date.now() - mountedAt.current);
      }}
      className="space-y-5"
    >
      {/* bot traps */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Company website
          <input type="text" name="company_website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <input ref={elapsedRef} type="hidden" name="elapsed_ms" defaultValue="" />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" name="name" autoComplete="name" required defaultValue={v.name} error={err.name} />
        <Field label="Email address" name="email" type="email" autoComplete="email" required defaultValue={v.email} error={err.email} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Phone number" name="phone" type="tel" autoComplete="tel" required defaultValue={v.phone} error={err.phone} hint="Include country code, e.g. +91" />
        <Field label="Organization" name="organization" autoComplete="organization" defaultValue={v.organization} error={err.organization} />
      </div>
      <div>
        <label htmlFor="interest" className="label-mono mb-2 block text-fg-dim">
          Area of interest <span className="text-signal">*</span>
        </label>
        <select
          id="interest"
          name="interest"
          required
          defaultValue={v.interest ?? prefill.interest}
          aria-invalid={Boolean(err.interest) || undefined}
          aria-describedby={err.interest ? "interest-error" : undefined}
          className="field"
        >
          <option value="">Select one</option>
          {inquiryInterests.map((i) => (
            <option key={i.value} value={i.value}>
              {i.label}
            </option>
          ))}
        </select>
        {err.interest && (
          <p id="interest-error" className="mt-2 text-sm text-alert">
            {err.interest}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="message" className="label-mono mb-2 block text-fg-dim">
          Mission requirement <span className="text-signal">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          minLength={10}
          rows={6}
          defaultValue={v.message ?? prefill.message}
          placeholder="Operating environment, payload, range, endurance, deployment schedule, or other requirements…"
          aria-invalid={Boolean(err.message) || undefined}
          aria-describedby={err.message ? "message-error" : undefined}
          className="field resize-y"
          data-lenis-prevent
        />
        {err.message && (
          <p id="message-error" className="mt-2 text-sm text-alert">
            {err.message}
          </p>
        )}
      </div>
      <label className="flex items-start gap-3 text-sm text-fg-muted">
        <input type="checkbox" name="marketingConsent" defaultChecked={v.marketingConsent === "on"} className="mt-1 size-4 shrink-0 accent-[var(--color-cyan)]" />
        <span>I agree to receive marketing communications from ASP Aero Tech by email, phone, SMS, or WhatsApp. I can unsubscribe at any time.</span>
      </label>

      <div ref={statusRef} tabIndex={-1} className="outline-none" aria-live="polite">
        {state.status === "error" && state.message && <p className="rounded-xl border border-alert/40 bg-alert/10 px-4 py-3 text-sm text-fg">{state.message}</p>}
      </div>

      <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:opacity-60" data-cursor="Transmit">
        {pending ? (
          <>
            <Loader2 size={18} className="animate-spin" /> Transmitting…
          </>
        ) : (
          <>
            Submit requirement <ArrowUpRight size={18} />
          </>
        )}
      </button>
      <p className="text-xs text-fg-dim">
        By submitting, you agree to our handling of your details as described in the privacy policy.
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  error,
  hint,
  defaultValue,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  defaultValue?: string;
  autoComplete?: string;
}) {
  const describedBy = [error && `${name}-error`, hint && `${name}-hint`].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <label htmlFor={name} className="label-mono mb-2 block text-fg-dim">
        {label} {required && <span className="text-signal">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy}
        className={cn("field")}
      />
      {hint && !error && (
        <p id={`${name}-hint`} className="mt-1.5 text-xs text-fg-dim">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${name}-error`} className="mt-2 text-sm text-alert">
          {error}
        </p>
      )}
    </div>
  );
}
