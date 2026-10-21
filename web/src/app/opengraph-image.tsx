import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = "ASP Aero Tech — Indigenous unmanned aerial systems";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Branded social card, generated at build time (no design tool needed). */
export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), "public/brand/asp-logo-reversed-sm.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "radial-gradient(ellipse at 75% 20%, #12305a 0%, #061024 45%, #02050b 100%)",
          color: "#e8eef8",
          position: "relative",
        }}
      >
        {/* HUD grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage: "linear-gradient(rgba(142,234,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(142,234,255,0.07) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* drone line art */}
        <svg width="460" height="340" viewBox="0 0 400 300" style={{ position: "absolute", right: 40, top: 150 }}>
          <g fill="none" stroke="#2bd9ff" strokeWidth="2">
            <path d="M140 90 L260 210 M260 90 L140 210" strokeWidth="5" />
            <circle cx="120" cy="70" r="48" strokeDasharray="4 8" />
            <circle cx="280" cy="70" r="48" strokeDasharray="4 8" />
            <circle cx="120" cy="230" r="48" strokeDasharray="4 8" />
            <circle cx="280" cy="230" r="48" strokeDasharray="4 8" />
            <ellipse cx="200" cy="150" rx="34" ry="52" fill="#08152b" />
          </g>
          <g fill="#f47e20">
            <circle cx="120" cy="70" r="7" />
            <circle cx="280" cy="70" r="7" />
            <circle cx="120" cy="230" r="7" />
            <circle cx="280" cy="230" r="7" />
          </g>
        </svg>

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={196} height={90} alt="" />
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: 700 }}>
          <div style={{ display: "flex", fontSize: 20, letterSpacing: 6, color: "#2bd9ff", textTransform: "uppercase" }}>Indigenous unmanned aerial systems</div>
          <div style={{ display: "flex", fontSize: 68, fontWeight: 700, lineHeight: 1.02, marginTop: 18, letterSpacing: -2 }}>Built to fly. Engineered for the mission.</div>
          <div style={{ display: "flex", fontSize: 24, color: "#a3b3ca", marginTop: 22 }}>{site.positioning}</div>
        </div>

        <div style={{ display: "flex", height: 6, width: 300 }}>
          <div style={{ flex: 1, background: "#F47E20" }} />
          <div style={{ flex: 1, background: "#E8EEF8" }} />
          <div style={{ flex: 1, background: "#138808" }} />
        </div>
      </div>
    ),
    { ...size },
  );
}
