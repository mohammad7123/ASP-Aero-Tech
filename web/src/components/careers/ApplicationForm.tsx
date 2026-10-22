"use client";

import { ArrowUpRight, CheckCircle2, FileText, Loader2, UploadCloud, X } from "lucide-react";
import { useActionState, useEffect, useRef, useState, type DragEvent } from "react";
import { submitApplication, type ApplicationState } from "@/app/careers/actions";
import { TLink } from "@/components/providers/PageTransition";
import { cn } from "@/lib/utils";

const MAX_CV_BYTES = 5 * 1024 * 1024;
const ACCEPT = ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const formatSize = (bytes: number) => (bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`);

/**
 * Job application (React 19 useActionState + Server Action), mirroring the
 * contact form: uncontrolled fields, bot traps, inline errors. The CV picker
 * checks type and size in the browser before anything is uploaded.
 */
export function ApplicationForm({ jobId, jobTitle }: { jobId: number; jobTitle: string }) {
  const [formKey, setFormKey] = useState(0);
  return <FormInner key={formKey} jobId={jobId} jobTitle={jobTitle} onReset={() => setFormKey((k) => k + 1)} />;
}

function FormInner({ jobId, jobTitle, onReset }: { jobId: number; jobTitle: string; onReset: () => void }) {
  const [state, action, pending] = useActionState<ApplicationState, FormData>(submitApplication.bind(null, jobId), { status: "idle" });
  const mountedAt = useRef(0);
  const elapsedRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (state.status !== "idle") statusRef.current?.focus();
    // React resets the form after each submission, which empties the file input; drop the stale chip.
    if (state.status === "error" && !fileRef.current?.files?.length) setFile(null);
  }, [state]);

  const pick = (next: File | null) => {
    setFileError("");
    if (!next) return setFile(null);
    const ext = next.name.split(".").pop()?.toLowerCase() ?? "";
    if (!["pdf", "doc", "docx"].includes(ext)) return setFileError("Upload a PDF, DOC or DOCX file.");
    if (next.size > MAX_CV_BYTES) return setFileError("Your CV must be smaller than 5 MB.");
    setFile(next);
    // Keep the real <input type=file> in sync so the form submits the dropped file.
    if (fileRef.current) {
      const dt = new DataTransfer();
      dt.items.add(next);
      fileRef.current.files = dt.files;
    }
  };

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragging(false);
    pick(e.dataTransfer.files?.[0] ?? null);
  };

  const clearFile = () => {
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const err = state.fieldErrors ?? {};
  const v = state.values ?? {};
  const cvError = fileError || err.cv;

  if (state.status === "success") {
    return (
      <div ref={statusRef} tabIndex={-1} className="flex min-h-[420px] flex-col items-center justify-center text-center outline-none" role="status">
        <span className="grid size-16 place-items-center rounded-full border border-go/40 bg-go/10 text-go">
          <CheckCircle2 size={30} />
        </span>
        <h2 className="mt-6 text-3xl font-semibold">Application received.</h2>
        <p className="mt-3 max-w-sm text-fg-muted">
          {state.message ?? `Thank you for applying for ${jobTitle}. Our team will review your profile and get in touch if it's a match.`}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
          <TLink href="/careers" className="link-arrow">
            See other roles
          </TLink>
          <button type="button" onClick={onReset} className="link-arrow">
            Submit another application
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!file) {
          e.preventDefault();
          setFileError("Attach your CV.");
          return;
        }
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
      <Field label="Phone number" name="phone" type="tel" autoComplete="tel" defaultValue={v.phone} error={err.phone} hint="Optional. Include country code, e.g. +91" />

      <div>
        <span className="label-mono mb-2 block text-fg-dim">
          CV / résumé <span className="text-signal">*</span>
        </span>
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            "group relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-6 py-8 text-center transition-colors",
            dragging ? "border-cyan bg-cyan/5" : "border-line-strong hover:border-cyan",
            cvError && "border-alert",
          )}
          data-cursor="Upload"
        >
          <input
            ref={fileRef}
            type="file"
            name="cv"
            accept={ACCEPT}
            className="sr-only"
            aria-invalid={Boolean(cvError) || undefined}
            aria-describedby={cvError ? "cv-error" : "cv-hint"}
            onChange={(e) => pick(e.target.files?.[0] ?? null)}
          />
          {file ? (
            <span className="flex w-full max-w-md items-center gap-3 rounded-xl border border-line bg-[var(--field-bg)] px-4 py-3 text-left">
              <FileText className="size-5 shrink-0 text-cyan" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-fg">{file.name}</span>
                <span className="block text-xs text-fg-dim">{formatSize(file.size)}</span>
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  clearFile();
                }}
                className="grid size-8 place-items-center rounded-full text-fg-dim hover:bg-line hover:text-fg"
                aria-label="Remove file"
              >
                <X size={16} />
              </button>
            </span>
          ) : (
            <>
              <UploadCloud className="size-8 text-cyan transition-transform duration-300 group-hover:-translate-y-0.5" strokeWidth={1.4} />
              <span className="text-sm font-medium text-fg">Drop your CV here or click to browse</span>
              <span id="cv-hint" className="text-xs text-fg-dim">
                PDF, DOC or DOCX · up to 5 MB
              </span>
            </>
          )}
        </label>
        {cvError && (
          <p id="cv-error" className="mt-2 text-sm text-alert">
            {cvError}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="coverLetter" className="label-mono mb-2 block text-fg-dim">
          Cover letter
        </label>
        <textarea
          id="coverLetter"
          name="coverLetter"
          rows={6}
          maxLength={5000}
          defaultValue={v.coverLetter}
          placeholder="Why this role, relevant projects, notice period, anything we should know…"
          aria-invalid={Boolean(err.coverLetter) || undefined}
          aria-describedby={err.coverLetter ? "coverLetter-error" : undefined}
          className="field resize-y"
          data-lenis-prevent
        />
        {err.coverLetter && (
          <p id="coverLetter-error" className="mt-2 text-sm text-alert">
            {err.coverLetter}
          </p>
        )}
      </div>

      <div ref={statusRef} tabIndex={-1} className="outline-none" aria-live="polite">
        {state.status === "error" && state.message && <p className="rounded-xl border border-alert/40 bg-alert/10 px-4 py-3 text-sm text-fg">{state.message}</p>}
      </div>

      <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:opacity-60" data-cursor="Apply">
        {pending ? (
          <>
            <Loader2 size={18} className="animate-spin" /> Uploading application…
          </>
        ) : (
          <>
            Submit application <ArrowUpRight size={18} />
          </>
        )}
      </button>
      <p className="text-xs text-fg-dim">Your details and CV are used only to assess your application, as described in our privacy policy.</p>
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
        className="field"
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
