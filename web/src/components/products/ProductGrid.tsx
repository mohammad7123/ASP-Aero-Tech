"use client";

import { ArrowUpRight } from "lucide-react";
import { useMemo, useState } from "react";
import { DroneBlueprint } from "@/components/blueprint/DroneBlueprint";
import { TLink } from "@/components/providers/PageTransition";
import type { Product } from "@/content/products";
import { formatSpec } from "@/lib/specs";
import { cn } from "@/lib/utils";

/** Filterable platform grid. Filter state is local; every card is a real link (crawlable). */
export function ProductGrid({ products, categories }: { products: Product[]; categories: string[] }) {
  const [active, setActive] = useState<string>("All");
  const available = useMemo(() => categories.filter((c) => products.some((p) => p.categories.includes(c))), [categories, products]);
  const shown = active === "All" ? products : products.filter((p) => p.categories.includes(active));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by mission profile">
        {["All", ...available].map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={active === c}
            onClick={() => setActive(c)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition-colors",
              active === c ? "border-cyan bg-cyan/10 text-fg" : "border-line text-fg-muted hover:border-line-strong hover:text-fg",
            )}
          >
            {c}
          </button>
        ))}
      </div>
      <p className="label-mono mt-6 text-fg-dim" aria-live="polite">
        {shown.length} {shown.length === 1 ? "platform" : "platforms"}
        {active !== "All" ? ` capable of ${active.toLowerCase()} missions` : ""}
      </p>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {shown.map((p) => {
          const keySpecs = [
            ["Range", p.specs.range],
            ["Endurance", p.specs.endurance],
            ["Payload", p.specs.payload],
          ].filter(([, v]) => v) as [string, string][];
          return (
            <li key={p.slug}>
              <TLink href={`/products/${p.slug}`} className="spot-card glass-solid group flex h-full flex-col overflow-hidden rounded-3xl" data-cursor="Specs">
                <div className="relative aspect-[4/3] border-b border-line bg-[radial-gradient(ellipse_at_50%_45%,var(--panel-1)_0%,var(--panel-2)_60%,var(--panel-3)_100%)]">
                  <DroneBlueprint preset={p.presentation.model.preset} className="absolute inset-0 size-full p-6 transition-transform duration-700 group-hover:scale-[1.04]" />
                  <span className="label-mono absolute left-4 top-4 text-cyan">{p.presentation.label}</span>
                  <ArrowUpRight className="absolute right-4 top-4 size-5 text-fg-dim transition-colors group-hover:text-signal" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="text-2xl font-semibold">{p.name}</h2>
                  <p className="label-mono mt-1 text-fg-dim">{p.presentation.airframe}</p>
                  <p className="mt-3 line-clamp-2 text-sm text-fg-muted">{p.description}</p>
                  {keySpecs.length > 0 && (
                    <dl className="mt-auto grid grid-cols-3 gap-2 border-t border-line pt-5">
                      {keySpecs.map(([k, v]) => (
                        <div key={k}>
                          <dt className="label-mono text-[10px] text-fg-dim">{k}</dt>
                          <dd className="mt-1 font-display text-sm font-medium text-fg">{formatSpec(v)}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>
              </TLink>
            </li>
          );
        })}
      </ul>
      {shown.length === 0 && <p className="mt-10 text-fg-muted">No published platforms are currently assigned to this mission profile.</p>}
    </div>
  );
}
