import { Router, type IRouter } from "express";
import healthRouter from "./health";
import inquiriesRouter from "./inquiries";
import adminRouter from "./admin";
import contentRouter from "./content";
import productsRouter from "./products";
import storageRouter from "./storage";
import settingsRouter from "./settings";
import campaignsRouter from "./campaigns";
import chatbotRouter from "./chatbot";
import careersRouter from "./careers";

const router: IRouter = Router();

router.use(healthRouter);
router.use(inquiriesRouter);
router.use(contentRouter);
router.use(adminRouter);
router.use(productsRouter);
router.use(storageRouter);
router.use(settingsRouter);
router.use(campaignsRouter);
router.use(chatbotRouter);
router.use(careersRouter);

export default router;
