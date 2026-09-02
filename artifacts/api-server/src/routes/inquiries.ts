import { Router, type IRouter } from "express";
import { CreateInquiryBody, CreateInquiryResponse } from "@workspace/api-zod";
import { db, inquiriesTable } from "@workspace/db";

const router: IRouter = Router();

router.post("/inquiries", async (req, res): Promise<void> => {
  const parsed = CreateInquiryBody.safeParse(req.body);

  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid inquiry");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [inquiry] = await db
    .insert(inquiriesTable)
    .values({
      ...parsed.data,
      organization: parsed.data.organization ?? null,
    })
    .returning();

  const response = CreateInquiryResponse.parse({
    ...inquiry,
    id: String(inquiry.id),
  });

  req.log.info({ inquiryId: inquiry.id }, "Website inquiry received");
  res.status(201).json(response);
});

export default router;