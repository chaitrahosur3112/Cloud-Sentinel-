// AI endpoints are read-only — all authenticated users can access them.
// The heavy lifting (model inference) happens in the Python service,
// not here — these are just orchestration routes.

import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import * as aiController from "../controllers/ai.controller";

const router = Router();

router.use(authenticate);

// org-level forecast — must come before /:resourceId or Express matches "org" as an ID
router.get("/forecast/org",               aiController.forecastOrg);
router.get("/forecast/:resourceId",        aiController.forecastResource);
router.get("/anomalies",                   aiController.detectAnomalies);

export default router;