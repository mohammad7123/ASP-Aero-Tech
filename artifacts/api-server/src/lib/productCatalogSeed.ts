import { pool } from "@workspace/db";

type SeedProduct = {
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  specs: Record<string, string>;
  features: string[];
  categories: string[];
};

const features = ["Encrypted Comms", "Autonomous", "Mission-Ready"];

const products: SeedProduct[] = [
  {
    slug: "surveillance-drone",
    name: "Surveillance Drone",
    description: "Long Range ISR missions.",
    imageUrl: "/product-images/surveillance.jpg",
    specs: { range: "10 KM", endurance: "40 MIN", payload: "5 KG", frameSize: '23"–36"', altitude: "15500 FT", agl: "500 M" },
    features,
    categories: ["Surveillance", "Photography & Videography", "Inspection", "Search & Rescue", "Military & Defense"],
  },
  {
    slug: "fixed-wing-drone",
    name: "Fixed Wing Drone",
    description: "Long endurance fixed wing drone for surveillance and reconnaissance.",
    imageUrl: "/product-images/fixed-wing.jpg",
    specs: { range: "100 KM", endurance: "120 MIN", payload: "1–2 KG", span: "2.5 M", maxSpeed: "100 KMPH", altitude: "15500 FT", agl: "500 M" },
    features,
    categories: ["Surveillance", "Agriculture", "Delivery", "Mapping & Surveying", "Inspection", "Search & Rescue", "Military & Defense"],
  },
  {
    slug: "vtol-drone",
    name: "VTOL Drone",
    description: "Vertical take-off and landing drone for versatile battlefield operations.",
    imageUrl: "/product-images/vtol.jpg",
    specs: { range: "10 KM", endurance: "40 MIN", payload: "3 KG", span: "3 M", maxSpeed: "80 KMPH", altitude: "15500 FT", agl: "500 M" },
    features,
    categories: ["Surveillance", "Delivery", "Mapping & Surveying", "Inspection", "Search & Rescue", "Military & Defense"],
  },
  {
    slug: "tethered-drone",
    name: "Tethered Drone",
    description: "Persistent surveillance drone with unlimited endurance.",
    imageUrl: "/product-images/tethered.jpg",
    specs: { endurance: "8 HRS", payload: "5 KG", frameSize: '23"–36"', altitude: "15500 FT", agl: "150 M" },
    features,
    categories: ["Surveillance", "Photography & Videography", "Inspection", "Search & Rescue", "Military & Defense"],
  },
  {
    slug: "fibre-optics-drone",
    name: "Fibre Optics Drone",
    description: "Immune to jamming with fibre optic controlled operations.",
    imageUrl: "/product-images/fibre-optics.jpg",
    specs: { range: "5–10 KM", payload: "500 GMS", frameSize: '15"', altitude: "15500 FT", agl: "500 M" },
    features,
    categories: ["Inspection", "Military & Defense", "Racing"],
  },
  {
    slug: "fpv-drone",
    name: "FPV Drone",
    description: "First Person View strike drone for close range precision missions.",
    imageUrl: "/product-images/fpv.jpg",
    specs: { range: "2–5 KM", endurance: "15–18 MIN", payload: "500 G–1 KG", frameSize: '3"–15"', maxSpeed: "80–120 KMPH", altitude: "15500 FT", agl: "500 M" },
    features,
    categories: ["Photography & Videography", "Inspection", "Military & Defense", "Recreational", "Racing"],
  },
  {
    slug: "mini-drone",
    name: "Mini Drone",
    description: "Compact and portable drone for tactical surveillance operations.",
    imageUrl: "/product-images/mini.jpg",
    specs: { range: "2 KM", endurance: "10 MIN", frameSize: '5"', maxSpeed: "50 KMPH", altitude: "15500 FT", agl: "500 M" },
    features,
    categories: ["Surveillance", "Photography & Videography", "Search & Rescue", "Military & Defense", "Recreational"],
  },
  {
    slug: "micro-drone",
    name: "Micro Drone",
    description: "Palm-sized micro drone for covert reconnaissance missions.",
    imageUrl: "/product-images/micro.jpg",
    specs: { range: "1 KM", endurance: "8 MIN", frameSize: '3"', maxSpeed: "40 KMPH", altitude: "15500 FT", agl: "500 M" },
    features,
    categories: ["Surveillance", "Photography & Videography", "Inspection", "Search & Rescue", "Military & Defense", "Recreational", "Racing"],
  },
  {
    slug: "loitering-munition",
    name: "Kamikaze Drone",
    description: "Loitering munition drone designed for precision strike missions.",
    imageUrl: "/product-images/loitering-munition.jpg",
    specs: { range: "5–10 KM", endurance: "30 MIN", payload: "2–4 KG", wingSpan: "2.5 M", maxSpeed: "80–100 KMPH", altitude: "15500 FT", agl: "500 M" },
    features,
    categories: ["Military & Defense"],
  },
];

export async function ensureProductCatalog(): Promise<void> {
  await pool.query(`
    ALTER TABLE product_items
      ADD COLUMN IF NOT EXISTS categories JSONB NOT NULL DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS specs JSONB NOT NULL DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS features JSONB NOT NULL DEFAULT '[]'::jsonb;
    CREATE UNIQUE INDEX IF NOT EXISTS product_items_slug_unique ON product_items (slug);
  `);

  const columns = ["category", "name", "slug", "short_desc", "description", "image_url", "icon_name", "accent_color", "sort_order", "is_active", "categories", "specs", "features"];
  const values = products.flatMap((product, index) => [
    product.categories[0],
    product.name,
    product.slug,
    product.description,
    product.description,
    product.imageUrl,
    "Package",
    "#D4920C",
    index,
    true,
    JSON.stringify(product.categories),
    JSON.stringify(product.specs),
    JSON.stringify(product.features),
  ]);
  const placeholders = products.map((_, row) =>
    `(${columns.map((__, column) => `$${row * columns.length + column + 1}`).join(",")})`,
  ).join(",");

  await pool.query(
    `INSERT INTO product_items (${columns.join(",")})
     VALUES ${placeholders}
     ON CONFLICT (slug) DO UPDATE SET
       categories = CASE WHEN product_items.categories = '[]'::jsonb THEN EXCLUDED.categories ELSE product_items.categories END,
       specs = CASE WHEN product_items.specs = '{}'::jsonb THEN EXCLUDED.specs ELSE product_items.specs END,
       features = CASE WHEN product_items.features = '[]'::jsonb THEN EXCLUDED.features ELSE product_items.features END,
       image_url = CASE WHEN product_items.image_url IS NULL THEN EXCLUDED.image_url ELSE product_items.image_url END`,
    values,
  );
}