import { Router } from "express";
import healthRoutes       from "./health.routes";
import authRoutes         from "./auth.routes";
import dashboardRoutes    from "./dashboard.routes";
import cloudAccountRoutes from "./cloudaccount.routes";
import resourceRoutes     from "./resource.routes";
import budgetRoutes       from "./budget.routes";
import alertRoutes        from "./alert.routes";
import analyticsRoutes    from "./analytics.routes";
import aiRoutes           from "./ai.routes";
import reportRoutes       from "./report.routes";   // ← new

const router = Router();

router.use("/health",         healthRoutes);
router.use("/auth",           authRoutes);
router.use("/dashboard",      dashboardRoutes);
router.use("/cloud-accounts", cloudAccountRoutes);
router.use("/resources",      resourceRoutes);
router.use("/budgets",        budgetRoutes);
router.use("/alerts",         alertRoutes);
router.use("/analytics",      analyticsRoutes);
router.use("/ai",             aiRoutes);
router.use("/reports",        reportRoutes);        // ← new

export default router;