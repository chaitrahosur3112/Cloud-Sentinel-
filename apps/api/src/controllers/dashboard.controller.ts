// Thin as always: read req.user, call service, write res.
// Every endpoint requires authenticate middleware (set in routes).
// organizationId comes from the JWT payload — not from req.params —
// so users can only ever query their own org's data.

import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as dashboardService from "../services/dashboard.service";

export const getSummary = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const data = await dashboardService.getSummary(organizationId);
  res.status(200).json({ success: true, data });
});

export const getRecentAlerts = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const data = await dashboardService.getRecentAlerts(organizationId);
  res.status(200).json({ success: true, data });
});

export const getDailyCosts = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const data = await dashboardService.getDailyCosts(organizationId);
  res.status(200).json({ success: true, data });
});

export const getMonthlyCosts = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const data = await dashboardService.getMonthlyCosts(organizationId);
  res.status(200).json({ success: true, data });
});

export const getCostsByService = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const data = await dashboardService.getCostsByService(organizationId);
  res.status(200).json({ success: true, data });
});

export const getBudgetStatus = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const data = await dashboardService.getBudgetStatus(organizationId);
  res.status(200).json({ success: true, data });
});