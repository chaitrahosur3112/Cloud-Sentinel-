// All dashboard routes require a valid access token.
// Viewers, Developers, Cloud Engineers, Finance Managers, and Org Admins
// can all see the dashboard — only Super Admin is org-agnostic and handled
// separately in a later phase.
// So here: just authenticate, no role restriction.

import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import * as dashboardController from "../controllers/dashboard.controller";

const router = Router();

router.use(authenticate); // applies to every route below

router.get("/summary",          dashboardController.getSummary);
router.get("/alerts/recent",    dashboardController.getRecentAlerts);
router.get("/costs/daily",      dashboardController.getDailyCosts);
router.get("/costs/monthly",    dashboardController.getMonthlyCosts);
router.get("/costs/by-service", dashboardController.getCostsByService);
router.get("/budgets/status",   dashboardController.getBudgetStatus);

export default router;