import type { ReactNode } from "react";
import { TLink } from "@/components/providers/PageTransition";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  text,
  align = "left",
  className,
  as: Tag = "h2",
}: {
  eyebrow: string;
  title: ReactNode;
  text?: ReactNode;
  align?: "left" | "center";
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      <p className={cn("eyebrow", align === "center" && "justify-center")} data-animate>
        {eyebrow}
      </p>
      <Tag className="mt-5 text-3xl font-semibold leading-[1.05] text-fg sm:text-4xl lg:text-5xl" data-animate style={{ ["--d" as string]: "80ms" }}>
        {title}
      </Tag>
      {text && (
        <p className="mt-5 text-base leading-relaxed text-fg-muted sm:text-lg" data-animate style={{ ["--d" as string]: "160ms" }}>
          {text}
        </p>
      )}
    </div>
  );
}

/** Standard hero for inner pages: HUD grid, breadcrumb trail, eyebrow, headline. */
export function PageHero({
  eyebrow,
  title,
  text,
  crumbs = [],
  children,
  aside,
}: {
  eyebrow: string;
  title: ReactNode;
  text?: ReactNode;
  crumbs?: { label: string; href?: string }[];
  children?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden pt-[calc(var(--header-h)+3.5rem)] pb-16 sm:pb-20">
      <div className="grid-bg grid-fade pointer-events-none absolute inset-0 opacity-70" aria-hidden />
      <div className="pointer-events-none absolute -right-40 -top-40 size-[34rem] rounded-full bg-cyan/10 blur-[120px]" aria-hidden />
      <div className="pointer-events-none absolute -bottom-48 left-1/4 size-[28rem] rounded-full bg-signal/10 blur-[120px]" aria-hidden />
      <div className="container-x relative">
        {crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="label-mono flex flex-wrap items-center gap-2 text-fg-dim">
              <li>
                <TLink href="/" className="hover:text-cyan">
                  Home
                </TLink>
              </li>
              {crumbs.map((c) => (
                <li key={c.label} className="flex items-center gap-2">
                  <span aria-hidden>/</span>
                  {c.href ? (
                    <TLink href={c.href} className="hover:text-cyan">
                      {c.label}
                    </TLink>
                  ) : (
                    <span aria-current="page" className="text-fg-muted">
                      {c.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <div className={cn("grid items-end gap-10", aside && "lg:grid-cols-[1.2fr_0.8fr]")}>
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.02] sm:text-5xl lg:text-7xl">{title}</h1>
            {text && <p className="mt-6 max-w-2xl text-base leading-relaxed text-fg-muted sm:text-lg">{text}</p>}
            {children}
          </div>
          {aside}
        </div>
      </div>
    </section>
  );
}

/** Small mono label with a status dot, e.g. "● SYS NOMINAL". */
export function StatusDot({ label, tone = "go" }: { label: string; tone?: "go" | "signal" | "cyan" }) {
  const color = { go: "bg-go", signal: "bg-signal", cyan: "bg-cyan" }[tone];
  return (
    <span className="label-mono inline-flex items-center gap-2 text-fg-muted">
      <span className="relative flex size-2">
        <span className={cn("absolute inline-flex size-full animate-ping rounded-full opacity-60", color)} />
        <span className={cn("relative inline-flex size-2 rounded-full", color)} />
      </span>
      {label}
    </span>
  );
}
