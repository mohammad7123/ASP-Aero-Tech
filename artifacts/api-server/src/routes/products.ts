import { Router, type IRouter } from "express";
import { GetProductParams, GetProductResponse, ListProductsResponse } from "@workspace/api-zod";
import { pool } from "@workspace/db";

const router: IRouter = Router();

function mapProduct(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    name: String(row.name),
    slug: String(row.slug),
    description: String(row.description || row.short_desc || ""),
    image: row.image_url ? String(row.image_url) : null,
    specs: (row.specs && typeof row.specs === "object" ? row.specs : {}) as Record<string, string>,
    features: Array.isArray(row.features) ? row.features.map(String) : [],
    categories: Array.isArray(row.categories) ? row.categories.map(String) : [],
  };
}

router.get("/products", async (_req, res): Promise<void> => {
  const result = await pool.query("SELECT id, name, slug, short_desc, description, image_url, specs, features, categories FROM product_items WHERE is_active = true ORDER BY sort_order ASC, id ASC");
  res.json(ListProductsResponse.parse(result.rows.map(mapProduct)));
});

router.get("/products/:slug", async (req, res): Promise<void> => {
  const params = GetProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid product slug" });
    return;
  }
  const result = await pool.query("SELECT id, name, slug, short_desc, description, image_url, specs, features, categories FROM product_items WHERE slug = $1 AND is_active = true LIMIT 1", [params.data.slug]);
  if (!result.rows[0]) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(GetProductResponse.parse(mapProduct(result.rows[0])));
});

export default router;