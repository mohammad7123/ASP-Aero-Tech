import type { Product, SpecKey } from "@/content/products";

export const specMeta: Record<SpecKey, { label: string }> = {
  range: { label: "Range" },
  endurance: { label: "Endurance" },
  payload: { label: "Payload" },
  maxSpeed: { label: "Max speed" },
  altitude: { label: "Altitude" },
  agl: { label: "AGL" },
  span: { label: "Span" },
  wingSpan: { label: "Wing span" },
  frameSize: { label: "Frame size" },
};

/** Display order for spec panels. */
export const specOrder: SpecKey[] = ["range", "endurance", "payload", "maxSpeed", "altitude", "agl", "span", "wingSpan", "frameSize"];

export function orderedSpecs(product: Pick<Product, "specs">) {
  return specOrder
    .filter((key) => product.specs[key])
    .map((key) => ({ key, label: specMeta[key].label, value: product.specs[key] as string }));
}

export type SpecToken = { type: "num"; value: number; decimals: number } | { type: "text"; value: string };

/**
 * Splits a spec string such as "500 G–1 KG" or "15500 FT" into numeric and
 * text tokens so numbers can count up in place while units stay put.
 */
export function tokenizeSpec(value: string): SpecToken[] {
  const tokens: SpecToken[] = [];
  const re = /\d+(?:\.\d+)?/g;
  let last = 0;
  for (const match of value.matchAll(re)) {
    const idx = match.index ?? 0;
    if (idx > last) tokens.push({ type: "text", value: value.slice(last, idx) });
    const raw = match[0];
    tokens.push({ type: "num", value: Number(raw), decimals: raw.includes(".") ? raw.split(".")[1].length : 0 });
    last = idx + raw.length;
  }
  if (last < value.length) tokens.push({ type: "text", value: value.slice(last) });
  return tokens;
}

const nf = new Intl.NumberFormat("en-IN");

export function formatSpecNumber(n: number, decimals = 0) {
  return decimals ? n.toFixed(decimals) : n >= 10000 ? nf.format(Math.round(n)) : String(Math.round(n));
}

/** "15500 FT" → "15,500 FT" for static rendering. */
export function formatSpec(value: string) {
  return tokenizeSpec(value)
    .map((t) => (t.type === "num" ? formatSpecNumber(t.value, t.decimals) : t.value))
    .join("");
}
