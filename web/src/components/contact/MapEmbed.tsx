"use client";

import { MapPin } from "lucide-react";
import { useState } from "react";

/**
 * Click-to-load map: Google Maps (and its cookies) only loads after the
 * visitor asks for it — better for privacy and for page speed.
 */
export function MapEmbed({ address, label }: { address: string; label: string }) {
  const [load, setLoad] = useState(false);
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=14&output=embed`;
  const external = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <div className="hud-corners relative aspect-[16/10] overflow-hidden rounded-3xl border border-line bg-navy-950">
      {load ? (
        <iframe
          title={`Map showing ${label}`}
          src={src}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 size-full dark:[filter:invert(0.92)_hue-rotate(180deg)_saturate(0.55)_contrast(0.92)]"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-6 text-center">
          <div className="grid-bg absolute inset-0 opacity-60" aria-hidden />
          <div className="relative grid size-24 place-items-center rounded-full border border-line-strong">
            <span className="absolute inset-0 animate-radar rounded-full bg-[conic-gradient(from_0deg,var(--hud-sweep),transparent_25%)]" aria-hidden />
            <MapPin className="relative size-7 text-signal" />
          </div>
          <p className="relative max-w-sm text-sm text-fg-muted">{address}</p>
          <div className="relative flex flex-wrap justify-center gap-2">
            <button type="button" onClick={() => setLoad(true)} className="btn btn-ghost min-h-0 px-4 py-2 text-sm">
              Load interactive map
            </button>
            <a href={external} target="_blank" rel="noopener noreferrer" className="btn min-h-0 px-4 py-2 text-sm text-fg-muted hover:text-fg">
              Open in Google Maps
            </a>
          </div>
          <p className="label-mono relative text-[10px] text-fg-dim">Loads content from Google</p>
        </div>
      )}
    </div>
  );
}
