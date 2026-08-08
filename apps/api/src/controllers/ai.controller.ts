import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as aiService from "../services/ai.service";

export const forecastResource = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const result = await aiService.forecastResourceCost(req.params.resourceId, organizationId);
  res.status(200).json({ success: true, data: result });
});

export const forecastOrg = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const result = await aiService.forecastOrgCost(organizationId);
  res.status(200).json({ success: true, data: result });
});

export const detectAnomalies = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const result = await aiService.detectCostAnomalies(organizationId);
  res.status(200).json({ success: true, data: result });
});