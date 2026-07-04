import { Router, type IRouter } from "express";
import healthRouter from "./health";
import aiRouter from "./ai";
import educationRouter from "./education";

const router: IRouter = Router();

router.use(healthRouter);
router.use(aiRouter);
router.use(educationRouter);

export default router;
