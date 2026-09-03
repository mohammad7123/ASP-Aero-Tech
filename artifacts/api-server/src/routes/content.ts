import { Router, type IRouter } from "express";
import { pool } from "@workspace/db";
import {
  GetPublishedBlogPostParams,
  GetPublishedBlogPostResponse,
  ListHeroSlidesResponse,
  ListOpenJobsResponse,
  ListPublishedBlogPostsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/content/hero-slides", async (_req, res): Promise<void> => {
  const result = await pool.query(`
    SELECT
      id,
      title,
      subtitle,
      image_url AS "imageUrl",
      eyebrow,
      badge,
      cta_text AS "ctaText",
      cta_url AS "ctaUrl",
      stat1,
      stat2,
      stat3
    FROM hero_slides
    WHERE is_active
    ORDER BY sort_order ASC, id ASC
  `);
  res.json(ListHeroSlidesResponse.parse(result.rows));
});

router.get("/content/jobs", async (_req, res): Promise<void> => {
  const result = await pool.query(`
    SELECT
      id,
      title,
      department,
      location,
      type,
      description,
      requirements,
      salary_range AS "salaryRange"
    FROM jobs
    WHERE is_active
      AND (closed_at IS NULL OR closed_at > now())
    ORDER BY sort_order ASC, id DESC
  `);
  res.json(ListOpenJobsResponse.parse(result.rows));
});

router.get("/content/blog-posts", async (_req, res): Promise<void> => {
  const result = await pool.query(`
    SELECT
      p.id,
      p.title,
      p.slug,
      p.excerpt,
      p.featured_image AS "featuredImage",
      c.name AS category,
      p.published_at AS "publishedAt"
    FROM blog_posts p
    LEFT JOIN blog_categories c ON c.id = p.category_id
    WHERE p.is_published
      AND (p.published_at IS NULL OR p.published_at <= now())
    ORDER BY p.published_at DESC NULLS LAST, p.id DESC
  `);
  res.json(ListPublishedBlogPostsResponse.parse(result.rows));
});

router.get("/content/blog-posts/:slug", async (req, res): Promise<void> => {
  const params = GetPublishedBlogPostParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid blog post" });
    return;
  }

  const result = await pool.query(`
    SELECT
      p.id,
      p.title,
      p.slug,
      p.excerpt,
      p.content,
      p.featured_image AS "featuredImage",
      c.name AS category,
      p.published_at AS "publishedAt",
      p.meta_title AS "metaTitle",
      p.meta_description AS "metaDescription"
    FROM blog_posts p
    LEFT JOIN blog_categories c ON c.id = p.category_id
    WHERE p.slug = $1
      AND p.is_published
      AND (p.published_at IS NULL OR p.published_at <= now())
    LIMIT 1
  `, [params.data.slug]);

  if (!result.rows[0]) {
    res.status(404).json({ error: "Blog post not found" });
    return;
  }
  res.json(GetPublishedBlogPostResponse.parse(result.rows[0]));
});

export default router;