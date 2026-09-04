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
  const name = parsed.data.name.trim();
  const email = parsed.data.email.trim();
  const phone = parsed.data.phone.trim();
  const interest = parsed.data.interest.trim();
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\+?[0-9().\-\s]{7,25}$/.test(phone) || !interest) {
    res.status(400).json({ error: "Provide a name, valid email, international phone number, and area of interest" });
    return;
  }

  const subject = [interest, parsed.data.organization?.trim()]
    .filter(Boolean)
    .join(" — ");
  const result = await pool.query(
    "INSERT INTO contact_inquiries (name, email, phone, organization, interest, marketing_consent, subject, message) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, created_at",
    [name, email, phone, parsed.data.organization?.trim() || null, interest, parsed.data.marketingConsent, subject, parsed.data.message?.trim() || null],
  );
  const inquiry = result.rows[0];

  const response = CreateInquiryResponse.parse({
    ...parsed.data, name, email, phone, interest,
    id: String(inquiry.id),
    organization: parsed.data.organization ?? null,
    createdAt: inquiry.created_at,
  });

  req.log.info({ inquiryId: inquiry.id }, "Website inquiry received");
  res.status(201).json(response);
});

export default router;