import { Router } from "express";
import healthRoutes       from "./health.routes";
import authRoutes         from "./auth.routes";
import dashboardRoutes    from "./dashboard.routes";
import cloudAccountRoutes from "./cloudaccount.routes";
import resourceRoutes     from "./resource.routes";

const router = Router();

router.use("/health",         healthRoutes);
router.use("/auth",           authRoutes);
router.use("/dashboard",      dashboardRoutes);
router.use("/cloud-accounts", cloudAccountRoutes);  // ← new
router.use("/resources",      resourceRoutes);      // ← new

export default router;