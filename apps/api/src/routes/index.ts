import { Router } from "express";
import healthRoutes    from "./health.routes";
import authRoutes      from "./auth.routes";
import dashboardRoutes from "./dashboard.routes";

const router = Router();

router.use("/health",    healthRoutes);
router.use("/auth",      authRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;