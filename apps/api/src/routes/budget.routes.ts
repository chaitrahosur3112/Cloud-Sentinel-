// ORG_ADMIN and FINANCE_MANAGER can create/edit/delete budgets.
// Everyone else (CLOUD_ENGINEER, DEVELOPER, VIEWER) can read them.

import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import { authorize }    from "../middlewares/authorize";
import { validateCreateBudget, validateUpdateBudget } from "../validators/budget.validator";
import * as controller from "../controllers/budget.controller";

const router = Router();

router.use(authenticate);

router.get( "/",      controller.listBudgets);
router.get( "/:id",   controller.getBudget);
router.post("/",      authorize("ORG_ADMIN", "FINANCE_MANAGER"), validateCreateBudget, controller.createBudget);
router.put( "/:id",   authorize("ORG_ADMIN", "FINANCE_MANAGER"), validateUpdateBudget, controller.updateBudget);
router.delete("/:id", authorize("ORG_ADMIN", "FINANCE_MANAGER"), controller.deleteBudget);

export default router;