import { Router, type IRouter } from "express";
import { CreateInquiryBody, CreateInquiryResponse } from "@workspace/api-zod";
import { pool } from "@workspace/db";

const router: IRouter = Router();

router.post("/inquiries", async (req, res): Promise<void> => {
  const parsed = CreateInquiryBody.safeParse(req.body);

  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid inquiry");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const subject = [parsed.data.interest, parsed.data.organization]
    .filter(Boolean)
    .join(" — ");
  const result = await pool.query(
    "INSERT INTO contact_inquiries (name, email, subject, message) VALUES ($1, $2, $3, $4) RETURNING id, created_at",
    [parsed.data.name, parsed.data.email, subject, parsed.data.message],
  );
  const inquiry = result.rows[0];

  const response = CreateInquiryResponse.parse({
    ...parsed.data,
    id: String(inquiry.id),
    organization: parsed.data.organization ?? null,
    createdAt: inquiry.created_at,
  });

  req.log.info({ inquiryId: inquiry.id }, "Website inquiry received");
  res.status(201).json(response);
});

export default router;