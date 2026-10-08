"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type GalleryItem = { src: string; title: string; caption: string; category: string };

/** Masonry-style grid with an accessible <dialog> lightbox (arrow keys, Escape, focus return). */
export function Gallery({ items }: { items: GalleryItem[] }) {
  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const categories = ["All", ...Array.from(new Set(items.map((i) => i.category)))];
  const shown = filter === "All" ? items : items.filter((i) => i.category === filter);

  const show = (i: number, el: HTMLElement) => {
    opener.current = el;
    setOpen(i);
    dialog.current?.showModal();
  };
  const close = useCallback(() => {
    dialog.current?.close();
  }, []);
  const step = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + shown.length) % shown.length)), [shown.length]);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    const onClose = () => {
      setOpen(null);
      opener.current?.focus();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    el.addEventListener("close", onClose);
    el.addEventListener("keydown", onKey);
    return () => {
      el.removeEventListener("close", onClose);
      el.removeEventListener("keydown", onKey);
    };
  }, [step]);

  const current = open !== null ? shown[open] : null;

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter gallery">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={filter === c}
            onClick={() => setFilter(c)}
            className={cn("rounded-full border px-4 py-2 text-sm transition-colors", filter === c ? "border-cyan bg-cyan/10 text-fg" : "border-line text-fg-muted hover:text-fg")}
          >
            {c}
          </button>
        ))}
      </div>

      <ul className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3">
        {shown.map((item, i) => (
          <li key={item.src} className="mb-4 break-inside-avoid">
            <button
              type="button"
              onClick={(e) => show(i, e.currentTarget)}
              className="spot-card group relative block w-full overflow-hidden rounded-2xl border border-line text-left"
              data-cursor="View"
            >
              <Image src={item.src} alt={item.title} width={1448} height={1086} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="h-auto w-full transition-transform duration-700 group-hover:scale-[1.03]" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-void/95 via-void/60 to-transparent p-5 pt-14">
                <span className="label-mono block text-cyan">{item.category}</span>
                <span className="mt-1 block font-display text-lg font-medium text-fg">{item.title}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        aria-label={current ? current.title : "Image viewer"}
        className="m-auto max-h-[94vh] w-[min(96vw,80rem)] overflow-visible bg-transparent p-0 text-fg backdrop:bg-void/90 backdrop:backdrop-blur-md"
        onClick={(e) => {
          if (e.target === dialog.current) close();
        }}
      >
        {current && (
          <figure className="relative">
            <Image src={current.src} alt={current.title} width={1448} height={1086} sizes="96vw" className="mx-auto h-auto max-h-[80vh] w-auto rounded-2xl border border-line object-contain" />
            <figcaption className="mt-4 flex flex-wrap items-baseline justify-between gap-3">
              <span>
                <span className="label-mono text-cyan">{current.category}</span>
                <span className="ml-3 font-display text-xl">{current.title}</span>
              </span>
              <span className="text-sm text-fg-muted">{current.caption}</span>
            </figcaption>
            <div className="absolute -top-14 right-0 flex gap-2">
              <button type="button" onClick={() => step(-1)} className="grid size-11 place-items-center rounded-full border border-line-strong bg-ink/80 hover:border-cyan" aria-label="Previous image">
                <ChevronLeft size={18} />
              </button>
              <button type="button" onClick={() => step(1)} className="grid size-11 place-items-center rounded-full border border-line-strong bg-ink/80 hover:border-cyan" aria-label="Next image">
                <ChevronRight size={18} />
              </button>
              <button type="button" onClick={close} className="grid size-11 place-items-center rounded-full border border-line-strong bg-ink/80 hover:border-cyan" aria-label="Close viewer" autoFocus>
                <X size={18} />
              </button>
            </div>
          </figure>
        )}
      </dialog>
    </div>
  );
}
