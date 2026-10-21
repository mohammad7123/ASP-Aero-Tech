/**
 * Builds src/content/indiaMap.ts: SVG paths for the home page "border watch" map.
 *
 *   node scripts/build-india-map.mjs
 *
 * Sources (Natural Earth, public domain):
 *  - ne_10m_admin_0_countries_ind  → India drawn with India's own point of view
 *    (the whole of Jammu & Kashmir and Ladakh inside India). Used for the outline.
 *  - ne_50m_admin_0_countries      → default boundaries, where India and Pakistan share
 *    the International Border and the Line of Control. Used for the patrol route.
 *
 * Natural Earth is a cartographic dataset, not the Survey of India. India has
 * legal requirements for how its external boundary is depicted, so before
 * publishing, replace `india` in the generated file with the outline from
 * the official Survey of India map.
 *
 * The output is committed; re-run only to change the extent or tolerances.
 */
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const BASE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/";
const get = async (name) => (await fetch(BASE + name)).json();

/* ───────────── projection (Mercator, fitted to the India region) ───────────── */
const W = 600;
const LNG0 = 67.6;
const LNG1 = 98.4;
const LAT0 = 5.6; // south
const LAT1 = 37.6; // north
const merc = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
const kx = W / (LNG1 - LNG0);
const yTop = merc(LAT1);
const ky = (W / ((LNG1 - LNG0) * (Math.PI / 180))) ;
const H = Math.round((merc(LAT1) - merc(LAT0)) * ky * 1) ;
const project = ([lng, lat]) => [(lng - LNG0) * kx, (yTop - merc(lat)) * ky];

/* ───────────── geometry helpers ───────────── */
const polygons = (g) => (g.type === "Polygon" ? [g.coordinates] : g.coordinates);

function dp(points, tol) {
  if (points.length < 3) return points;
  const keep = new Uint8Array(points.length);
  keep[0] = keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    let max = 0;
    let idx = -1;
    const [ax, ay] = points[a];
    const [bx, by] = points[b];
    const dx = bx - ax;
    const dy = by - ay;
    const len = Math.hypot(dx, dy) || 1e-9;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs(dy * points[i][0] - dx * points[i][1] + bx * ay - by * ax) / len;
      if (d > max) {
        max = d;
        idx = i;
      }
    }
    if (max > tol && idx > 0) {
      keep[idx] = 1;
      stack.push([a, idx], [idx, b]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

/** Douglas–Peucker for a closed ring: split at the point farthest from the start so the anchor isn't degenerate. */
function dpRing(ring, tol) {
  const pts = ring.length > 1 && ring[0][0] === ring.at(-1)[0] && ring[0][1] === ring.at(-1)[1] ? ring.slice(0, -1) : ring;
  if (pts.length < 4) return pts;
  let far = 0;
  let fd = -1;
  pts.forEach(([x, y], i) => {
    const d = (x - pts[0][0]) ** 2 + (y - pts[0][1]) ** 2;
    if (d > fd) {
      fd = d;
      far = i;
    }
  });
  const a = dp(pts.slice(0, far + 1), tol);
  const b = dp([...pts.slice(far), pts[0]], tol);
  return [...a.slice(0, -1), ...b.slice(0, -1)];
}

/** Sutherland–Hodgman against an axis-aligned rectangle. */
function clipRing(ring, [x0, y0, x1, y1]) {
  const edges = [
    [(p) => p[0] >= x0, (a, b) => [x0, a[1] + ((b[1] - a[1]) * (x0 - a[0])) / (b[0] - a[0])]],
    [(p) => p[0] <= x1, (a, b) => [x1, a[1] + ((b[1] - a[1]) * (x1 - a[0])) / (b[0] - a[0])]],
    [(p) => p[1] >= y0, (a, b) => [a[0] + ((b[0] - a[0]) * (y0 - a[1])) / (b[1] - a[1]), y0]],
    [(p) => p[1] <= y1, (a, b) => [a[0] + ((b[0] - a[0]) * (y1 - a[1])) / (b[1] - a[1]), y1]],
  ];
  let out = ring;
  for (const [inside, cut] of edges) {
    const input = out;
    out = [];
    for (let i = 0; i < input.length; i++) {
      const cur = input[i];
      const prev = input[(i + input.length - 1) % input.length];
      if (inside(cur)) {
        if (!inside(prev)) out.push(cut(prev, cur));
        out.push(cur);
      } else if (inside(prev)) out.push(cut(prev, cur));
    }
    if (!out.length) break;
  }
  return out;
}

const fmt = (n) => String(Math.round(n * 10) / 10);
const ringPath = (pts) => (pts.length < 3 ? "" : "M" + pts.map(([x, y]) => `${fmt(x)} ${fmt(y)}`).join("L") + "Z");

function shapePath(features, { tol, clip }) {
  const rect = [-10, -10, W + 10, H + 10];
  let d = "";
  for (const f of features) {
    for (const poly of polygons(f.geometry)) {
      for (const ring of poly) {
        let pts = ring.map(project);
        if (clip) pts = clipRing(pts, rect);
        if (pts.length < 3) continue;
        pts = dpRing(pts, tol);
        // drop specks smaller than ~1 px
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (const [x, y] of pts) {
          minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
        }
        if (maxX - minX < 1.2 && maxY - minY < 1.2) continue;
        d += ringPath(pts);
      }
    }
  }
  return d;
}

/* ───────────── India–Pakistan line (IB + LoC) from the default dataset ───────────── */
function sharedBorder(india, pakistan) {
  const key = (p) => `${p[0].toFixed(5)},${p[1].toFixed(5)}`;
  const pakEdges = new Set();
  for (const poly of polygons(pakistan.geometry))
    for (const ring of poly)
      for (let i = 0; i < ring.length - 1; i++) {
        pakEdges.add(key(ring[i]) + ">" + key(ring[i + 1]));
        pakEdges.add(key(ring[i + 1]) + ">" + key(ring[i]));
      }
  const segs = [];
  for (const poly of polygons(india.geometry))
    for (const ring of poly)
      for (let i = 0; i < ring.length - 1; i++)
        if (pakEdges.has(key(ring[i]) + ">" + key(ring[i + 1]))) segs.push([ring[i], ring[i + 1]]);

  // chain segments end to end
  const byStart = new Map();
  const ends = new Map();
  for (const s of segs) {
    for (const p of s) ends.set(key(p), (ends.get(key(p)) ?? 0) + 1);
    byStart.set(key(s[0]), (byStart.get(key(s[0])) ?? []).concat([s]));
    byStart.set(key(s[1]), (byStart.get(key(s[1])) ?? []).concat([[s[1], s[0]]]));
  }
  const used = new Set();
  const segKey = (a, b) => [key(a), key(b)].sort().join("|");
  const chains = [];
  const startPts = [...ends.entries()].filter(([, n]) => n === 1).map(([k]) => k);
  const walk = (startKey) => {
    const chain = [];
    let cur = startKey;
    for (;;) {
      const next = (byStart.get(cur) ?? []).find(([a, b]) => !used.has(segKey(a, b)));
      if (!next) break;
      used.add(segKey(next[0], next[1]));
      if (!chain.length) chain.push(next[0]);
      chain.push(next[1]);
      cur = key(next[1]);
    }
    return chain;
  };
  for (const s of startPts) {
    const c = walk(s);
    if (c.length > 1) chains.push(c);
  }
  // anything left over (closed loops, or no free ends)
  for (const s of segs) {
    if (!used.has(segKey(s[0], s[1]))) {
      const c = walk(key(s[0]));
      if (c.length > 1) chains.push(c);
    }
  }
  chains.sort((a, b) => b.length - a.length);
  return chains;
}

const [indDs, defDs] = await Promise.all([get("ne_10m_admin_0_countries_ind.geojson"), get("ne_50m_admin_0_countries.geojson")]);
const byA3 = (ds, a3) => ds.features.find((f) => f.properties.ADM0_A3 === a3 || f.properties.ADM0_A3_IN === a3);

const india = shapePath([byA3(indDs, "IND")], { tol: 0.22, clip: false });
const neighbours = shapePath(
  ["PAK", "CHN", "NPL", "BTN", "BGD", "MMR", "LKA", "AFG", "TJK", "MDV"].map((a) => byA3(indDs, a)).filter(Boolean),
  { tol: 0.3, clip: true },
);

const chains = sharedBorder(byA3(defDs, "IND"), byA3(defDs, "PAK"));
console.log("border chains (points):", chains.map((c) => c.length).join(", "));
let main = chains[0];
// run south → north
if (main[0][1] > main[main.length - 1][1]) main = [...main].reverse();
const line = dp(main.map(project), 0.12);
const borderD = "M" + line.map(([x, y]) => `${fmt(x)} ${fmt(y)}`).join("L");

/* ───────────── patrol sectors, snapped to the line ───────────── */
const sectors = [
  { id: "kutch", name: "Rann of Kutch · Sir Creek", detail: "Salt marsh and tidal creeks, a coastline no vehicle can hold", hint: [23.97, 68.2], terrain: "Marsh" },
  { id: "thar", name: "Thar Desert · Rajasthan", detail: "Heat, dust and sight lines that run to the horizon", hint: [26.9, 70.1], terrain: "Desert" },
  { id: "punjab", name: "Punjab Plains", detail: "Dense farmland and a border fence that has to be watched end to end", hint: [31.6, 74.55], terrain: "Plains" },
  { id: "jammu", name: "Jammu · International Border", detail: "River belts and low hills between the plains and the Pir Panjal", hint: [32.65, 74.75], terrain: "Foothills" },
  { id: "poonch", name: "Pir Panjal · Line of Control", detail: "Forested ridgelines where ground patrols lose line of sight", hint: [33.75, 74.0], terrain: "Forest ridge" },
  { id: "kashmir", name: "Kashmir Valley · Line of Control", detail: "Steep passes and early-winter weather, watched day and night", hint: [34.4, 73.85], terrain: "Mountain" },
  { id: "siachen", name: "Siachen · Karakoram", detail: "Rated to 15,500 ft: the platforms that go where crews cannot stay", hint: [35.4, 77.05], terrain: "High altitude" },
].map((s) => {
  const [lat, lng] = s.hint;
  const [px, py] = project([lng, lat]);
  let best = 0;
  let bd = Infinity;
  line.forEach(([x, y], i) => {
    const d = (x - px) ** 2 + (y - py) ** 2;
    if (d < bd) {
      bd = d;
      best = i;
    }
  });
  const [x, y] = line[best];
  return { id: s.id, name: s.name, detail: s.detail, terrain: s.terrain, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
});

const out = `/**
 * GENERATED by scripts/build-india-map.mjs — do not edit by hand.
 *
 * Source: Natural Earth (public domain). The outline uses Natural Earth's
 * India point-of-view dataset. It is NOT the Survey of India outline: before
 * publishing, swap \`india\` for the official one (see the script header).
 */
export const MAP = {
  width: ${W},
  height: ${H},
  /** Mercator extent the paths were projected with (for lat/lng read-outs). */
  lng: [${LNG0}, ${LNG1}] as [number, number],
  latTop: ${LAT1},
  latBottom: ${LAT0},
};

export const indiaPath = ${JSON.stringify(india)};
export const neighbourPath = ${JSON.stringify(neighbours)};
/** International Border + Line of Control with Pakistan, south (Sir Creek) to north (Siachen). */
export const borderPath = ${JSON.stringify(borderD)};

export type BorderSector = { id: string; name: string; detail: string; terrain: string; x: number; y: number };
export const borderSectors: BorderSector[] = ${JSON.stringify(sectors, null, 2)};
`;
const target = fileURLToPath(new URL("../src/content/indiaMap.ts", import.meta.url));
await writeFile(target, out);
console.log("wrote", target, `${(out.length / 1024).toFixed(1)} KB`, `viewBox 0 0 ${W} ${H}`);
