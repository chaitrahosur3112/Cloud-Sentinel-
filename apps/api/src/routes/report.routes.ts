// Generating reports is allowed for all roles except VIEWER.
// Downloading is allowed for everyone who can see the report list.

import { Router }   from "express";
import { authenticate } from "../middlewares/authenticate";
import { authorize }    from "../middlewares/authorize";
import { validateGenerateReport } from "../validators/report.validator";
import * as controller from "../controllers/report.controller";

const router = Router();

router.use(authenticate);

router.get( "/",          controller.listReports);
router.get( "/:id/download", controller.downloadReport);
router.post("/",
  authorize("ORG_ADMIN", "FINANCE_MANAGER", "CLOUD_ENGINEER", "DEVELOPER"),
  validateGenerateReport,
  controller.generateReport
);

export default router;