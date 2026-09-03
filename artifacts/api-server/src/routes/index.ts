import { Router, type IRouter } from "express";
import healthRouter from "./health";
import inquiriesRouter from "./inquiries";
import adminRouter from "./admin";
import contentRouter from "./content";
import productsRouter from "./products";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(inquiriesRouter);
router.use(contentRouter);
router.use(adminRouter);
router.use(productsRouter);
router.use(storageRouter);

export default router;
