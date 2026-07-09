import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as service from "../services/resource.service";
import { ResourceFilter } from "../dtos/resource.dto";

export const listResources = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const { type, provider, region, page, limit } = req.query;

  // Build the filter object — organizationId always comes from the JWT,
  // never from query params (a user can't request another org's resources)
  const filter: ResourceFilter = {
    organizationId,
    type:     type     ? String(type)     as never : undefined,
    provider: provider ? String(provider) as never : undefined,
    region:   region   ? String(region)             : undefined,
    page:     parseInt(String(page  ?? "1"),  10),
    limit:    parseInt(String(limit ?? "20"), 10),
  };

  const result = await service.listResources(filter);
  res.status(200).json({ success: true, ...result });
});

export const getResourceDetail = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const result = await service.getResourceDetail(req.params.id, organizationId);
  res.status(200).json({ success: true, data: result });
});

export const getResourceCostHistory = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const result = await service.getResourceCostHistory(req.params.id, organizationId);
  res.status(200).json({ success: true, data: result });
});

export const getResourceTypeSummary = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const result = await service.getResourceTypeSummary(organizationId);
  res.status(200).json({ success: true, data: result });
});