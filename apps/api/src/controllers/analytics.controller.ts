import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as service from "../services/analytics.service";
import { DateRangeFilter } from "../dtos/analytics.dto";

// res.locals.fromDate and res.locals.toDate are set by validateDateRange middleware
function buildFilter(req: Request, res: Response): DateRangeFilter {
  return {
    organizationId: req.user!.organizationId,
    from: res.locals.fromDate as Date,
    to:   res.locals.toDate   as Date,
  };
}

export const getCostTrend = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.getCostTrend(buildFilter(req, res));
  res.status(200).json({ success: true, data: result });
});

export const getCostByRegion = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.getCostByRegion(buildFilter(req, res));
  res.status(200).json({ success: true, data: result });
});

export const getCostByProvider = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.getCostByProvider(buildFilter(req, res));
  res.status(200).json({ success: true, data: result });
});

export const getTopResources = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.getTopResources(buildFilter(req, res));
  res.status(200).json({ success: true, data: result });
});