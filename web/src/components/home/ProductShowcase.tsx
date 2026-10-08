"use client";

import { ArrowLeft, ArrowRight, ArrowUpRight, Boxes, Check } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { DroneBlueprint } from "@/components/blueprint/DroneBlueprint";
import { useTier } from "@/components/providers/DeviceTier";
import { TLink } from "@/components/providers/PageTransition";
import { PRESETS } from "@/components/three/models/presets";
import { CountUp } from "@/components/ui/CountUp";
import type { Product } from "@/content/products";
import { useFinePointer } from "@/lib/hooks";
import { orderedSpecs } from "@/lib/specs";
import { cn } from "@/lib/utils";

const ProductViewer = dynamic(() => import("@/components/three/viewer/ProductViewer"), { ssr: false });

/** Lazy-mount when near the viewport; run the render loop only while visible. */
export function useViewportPresence(margin = "400px 0px") {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const nearIo = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true);
          nearIo.disconnect();
        }
      },
      { rootMargin: margin },
    );
    const visIo = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.02 });
    nearIo.observe(el);
    visIo.observe(el);
    return () => {
      nearIo.disconnect();
      visIo.disconnect();
    };
  }, [margin]);
  return { ref, near, visible };
}

export function ProductShowcase({
  products,
  initialSlug,
  heading = true,
  compact = false,
}: {
  products: Product[];
  initialSlug?: string;
  heading?: boolean;
  /** Single-product mode (product detail page): no switcher. */
  compact?: boolean;
}) {
  const tier = useTier();
  const [index, setIndex] = useState(() => Math.max(0, products.findIndex((p) => p.slug === initialSlug)));
  const [exploded, setExploded] = useState(false);
  const [viewerReady, setViewerReady] = useState(false);
  const onViewerReady = useCallback(() => setViewerReady(true), []);
  const fine = useFinePointer();
  const { ref, near, visible } = useViewportPresence();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const product = products[index] ?? products[0];
  const preset = product.presentation.model.preset;
  const webgl = tier === "high" || tier === "low";
  const canExplode = webgl && PRESETS[preset]?.kind === "multi" && product.presentation.model.kind === "procedural";
  const specs = orderedSpecs(product);
  const dimension = product.specs.span ? `Span ${product.specs.span}` : product.specs.wingSpan ? `Wing span ${product.specs.wingSpan}` : product.specs.frameSize ? `Frame ${product.specs.frameSize}` : undefined;

  const select = (i: number, focus = false) => {
    const n = (i + products.length) % products.length;
    setIndex(n);
    setExploded(false);
    if (focus) tabRefs.current[n]?.focus();
  };

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const keys: Record<string, number> = { ArrowDown: i + 1, ArrowRight: i + 1, ArrowUp: i - 1, ArrowLeft: i - 1, Home: 0, End: products.length - 1 };
    if (e.key in keys) {
      e.preventDefault();
      select(keys[e.key], true);
    }
  };

  return (
    <section className={cn("relative overflow-hidden bg-ink", !compact && "py-24 sm:py-32")} aria-labelledby={heading ? "platforms-title" : undefined}>
      {!compact && <div className="pointer-events-none absolute right-0 top-1/3 size-[40rem] rounded-full bg-cyan/[0.07] blur-[140px]" aria-hidden />}
      <div className={cn(!compact && "container-x", "relative")}>
        {heading && (
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div className="max-w-3xl">
              <p className="eyebrow" data-animate>
                Our UAS portfolio
              </p>
              <h2 id="platforms-title" className="mt-5 text-3xl font-semibold leading-[1.05] sm:text-4xl lg:text-5xl" data-animate>
                Aerial platforms built around <span className="text-cyan">the mission.</span>
              </h2>
              <p className="mt-5 text-base leading-relaxed text-fg-muted sm:text-lg" data-animate>
                Modular unmanned systems for surveillance, tactical awareness, industrial inspection, and autonomous field operations.
              </p>
            </div>
            <TLink href="/products" className="link-arrow" data-animate>
              Compare all platforms <ArrowRight size={14} />
            </TLink>
          </div>
        )}

        <div className={cn("grid gap-5", heading && "mt-14", compact ? "lg:grid-cols-[1fr_24rem]" : "lg:grid-cols-[17rem_1fr_23rem]")}>
          {/* model switcher */}
          {!compact && (
            <div role="tablist" aria-label="Select a platform" aria-orientation="vertical" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0" data-lenis-prevent-horizontal>
              {products.map((p, i) => {
                const selected = i === index;
                return (
                  <button
                    key={p.slug}
                    ref={(el) => {
                      tabRefs.current[i] = el;
                    }}
                    id={`tab-${p.slug}`}
                    role="tab"
                    type="button"
                    aria-selected={selected}
                    aria-controls="platform-panel"
                    tabIndex={selected ? 0 : -1}
                    onClick={() => select(i)}
                    onKeyDown={(e) => onTabKey(e, i)}
                    className={cn(
                      "group relative flex shrink-0 items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors lg:w-full",
                      selected ? "border-cyan/50 bg-cyan/[0.08] text-fg" : "border-line text-fg-muted hover:border-line-strong hover:text-fg",
                    )}
                  >
                    <span className={cn("label-mono", selected ? "text-cyan" : "text-fg-dim")}>{String(i + 1).padStart(2, "0")}</span>
                    <span className="min-w-0">
                      <span className="block whitespace-nowrap font-display text-sm font-medium">{p.name}</span>
                      <span className="hidden truncate text-[11px] text-fg-dim lg:block">{p.presentation.airframe}</span>
                    </span>
                    {selected && <span className="absolute inset-y-3 left-0 w-0.5 rounded-full bg-cyan shadow-[0_0_10px_var(--color-cyan)]" aria-hidden />}
                  </button>
                );
              })}
            </div>
          )}

          {/* viewer */}
          <div
            ref={ref}
            id="platform-panel"
            role={compact ? undefined : "tabpanel"}
            aria-labelledby={compact ? undefined : `tab-${product.slug}`}
            className="hud-corners relative aspect-[4/3.4] overflow-hidden rounded-3xl border border-line bg-[radial-gradient(ellipse_at_50%_40%,var(--panel-1)_0%,var(--panel-2)_55%,var(--panel-3)_100%)] lg:aspect-auto lg:min-h-[560px]"
            data-cursor={webgl && fine ? "Drag" : undefined}
          >
            <div className="grid-bg absolute inset-0 opacity-40" aria-hidden />
            {/* The blueprint holds the stage until the 3D viewer has compiled its shaders, then cross-fades out. */}
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center p-8 transition-opacity duration-700",
                webgl && near && viewerReady ? "opacity-0" : "opacity-100",
              )}
              aria-hidden={(webgl && near && viewerReady) || undefined}
            >
              <DroneBlueprint key={product.slug} preset={preset} animated dimension={dimension} className="w-full max-w-[560px] animate-[rise_0.8s_var(--ease-out-expo)]" title={`${product.name} schematic`} />
            </div>
            {webgl && near && (
              <div className={cn("absolute inset-0 transition-opacity duration-700", viewerReady ? "opacity-100" : "opacity-0")}>
                <ProductViewer
                  model={product.presentation.model}
                  modelKey={product.slug}
                  tier={tier}
                  active={visible}
                  interactive={fine}
                  explode={exploded ? 1 : 0}
                  onReady={onViewerReady}
                />
              </div>
            )}

            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-5">
              <div>
                <p className="label-mono text-cyan">{product.presentation.label}</p>
                <p className="label-mono mt-1 text-fg-dim">{product.presentation.airframe}</p>
              </div>
              <p className="label-mono text-fg-dim">
                {String(index + 1).padStart(2, "0")} / {String(products.length).padStart(2, "0")}
              </p>
            </div>
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
              <p className="label-mono pointer-events-none text-fg-dim">{webgl ? (fine ? "Drag to rotate" : "Auto-rotating") : "Schematic view"}</p>
              <div className="flex items-center gap-2">
                {canExplode && (
                  <button
                    type="button"
                    onClick={() => setExploded((v) => !v)}
                    aria-pressed={exploded}
                    className={cn("chip h-10 whitespace-nowrap px-3 transition-colors", exploded ? "border-signal/60 text-signal" : "hover:text-fg")}
                  >
                    <Boxes size={14} /> {exploded ? "Assemble" : "Exploded view"}
                  </button>
                )}
                {!compact && (
                  <>
                    <button type="button" onClick={() => select(index - 1)} className="grid size-10 place-items-center rounded-full border border-line-strong bg-ink/60 text-fg hover:border-cyan" aria-label="Previous platform">
                      <ArrowLeft size={16} />
                    </button>
                    <button type="button" onClick={() => select(index + 1)} className="grid size-10 place-items-center rounded-full border border-line-strong bg-ink/60 text-fg hover:border-cyan" aria-label="Next platform">
                      <ArrowRight size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* spec panel */}
          <aside className="glass-solid flex flex-col rounded-3xl p-6 sm:p-7" aria-live="polite">
            <p className="label-mono text-signal">Platform {String(index + 1).padStart(2, "0")}</p>
            <SpecTitle as={compact ? "h2" : "h3"}>{product.name}</SpecTitle>
            <p className="mt-3 text-sm leading-relaxed text-fg-muted">{product.presentation.summary ?? product.description}</p>
            <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line">
              {specs.slice(0, compact ? specs.length : 6).map((s) => (
                <div key={s.key} className="bg-navy-950 p-4">
                  <dt className="label-mono text-fg-dim">{s.label}</dt>
                  <dd className="mt-1.5 font-display text-xl font-medium text-fg">
                    <CountUp key={`${product.slug}-${s.key}`} value={s.value} className="tabular" duration={1.2} />
                  </dd>
                </div>
              ))}
            </dl>
            <ul className="mt-5 flex flex-wrap gap-1.5">
              {product.features.map((f) => (
                <li key={f} className="chip">
                  <Check size={12} className="text-go" /> {f}
                </li>
              ))}
            </ul>
            <div className="mt-auto flex flex-wrap gap-2 pt-7">
              {!compact && (
                <TLink href={`/products/${product.slug}`} className="btn btn-ghost min-h-0 flex-1 px-4 py-2.5 text-sm">
                  Full specifications
                </TLink>
              )}
              <TLink href={`/contact?platform=${product.slug}`} className="btn btn-primary min-h-0 flex-1 px-4 py-2.5 text-sm" data-cursor="Brief us">
                Request briefing <ArrowUpRight size={15} />
              </TLink>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

/** Spec-panel title: an h2 on product pages (directly under the h1), h3 inside the home showcase. */
function SpecTitle({ as: Tag, children }: { as: "h2" | "h3"; children: React.ReactNode }) {
  return <Tag className="mt-3 text-3xl font-semibold leading-tight">{children}</Tag>;
}
