// All authenticated users can view alerts.
// CLOUD_ENGINEER, FINANCE_MANAGER, and ORG_ADMIN can acknowledge/resolve.
// DEVELOPER and VIEWER are read-only.

import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import { authorize }    from "../middlewares/authorize";
import * as controller  from "../controllers/alert.controller";

const router = Router();

router.use(authenticate);

router.get("/"                  , controller.listAlerts);
router.patch("/:id/acknowledge" , authorize("ORG_ADMIN", "FINANCE_MANAGER", "CLOUD_ENGINEER"), controller.acknowledgeAlert);
router.patch("/:id/resolve"     , authorize("ORG_ADMIN", "FINANCE_MANAGER", "CLOUD_ENGINEER"), controller.resolveAlert);

export default router;