import { Router } from "express";
import { authenticate }     from "../middlewares/authenticate";
import { validateDateRange } from "../validators/analytics.validator";
import * as controller       from "../controllers/analytics.controller";

const router = Router();

router.use(authenticate);
router.use(validateDateRange); // applies to all analytics routes — every one needs a date range

router.get("/cost-trend",    controller.getCostTrend);
router.get("/cost-by-region",  controller.getCostByRegion);
router.get("/cost-by-provider", controller.getCostByProvider);
router.get("/top-resources",   controller.getTopResources);

export default router;