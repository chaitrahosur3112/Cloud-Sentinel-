// All authenticated users can read resources.
// summary must come before /:id — otherwise Express matches "summary"
// as the :id param and the wrong controller runs.

import { Router } from "express";
import { authenticate }           from "../middlewares/authenticate";
import { validateResourceQuery }  from "../validators/resource.validator";
import * as controller            from "../controllers/resource.controller";

const router = Router();

router.use(authenticate);

router.get("/summary",         controller.getResourceTypeSummary);
router.get("/",                validateResourceQuery, controller.listResources);
router.get("/:id",             controller.getResourceDetail);
router.get("/:id/costs",       controller.getResourceCostHistory);

export default router;