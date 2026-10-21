import { ArrowLeft } from "lucide-react";
import { TLink } from "@/components/providers/PageTransition";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden pt-[var(--header-h)]">
      <div className="grid-bg grid-fade pointer-events-none absolute inset-0" aria-hidden />
      <div className="container-x relative text-center">
        <p className="label-mono text-alert">Signal lost · Error 404</p>
        <h1 className="mt-6 font-display text-[22vw] font-bold leading-none tracking-tighter text-fg/90 sm:text-[12rem]">404</h1>
        <p className="mx-auto mt-4 max-w-md text-fg-muted">This waypoint isn&apos;t on our flight plan. The page may have moved, or the link may be incorrect.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <TLink href="/" className="btn btn-primary">
            <ArrowLeft size={18} /> Return to base
          </TLink>
          <TLink href="/products" className="btn btn-ghost">
            View platforms
          </TLink>
        </div>
      </div>
    </section>
  );
}
