"use client";

import { RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden pt-[var(--header-h)]">
      <div className="grid-bg grid-fade pointer-events-none absolute inset-0" aria-hidden />
      <div className="container-x relative text-center">
        <p className="label-mono text-alert">System fault</p>
        <h1 className="mt-6 text-4xl font-semibold sm:text-6xl">Something went wrong.</h1>
        <p className="mx-auto mt-4 max-w-md text-fg-muted">An unexpected error interrupted this page. You can retry, or head back to the home page.</p>
        {error.digest && <p className="label-mono mt-4 text-fg-dim">Ref {error.digest}</p>}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn btn-primary">
            <RotateCcw size={18} /> Retry
          </button>
          <Link href="/" className="btn btn-ghost">
            Home
          </Link>
        </div>
      </div>
    </section>
  );
}
