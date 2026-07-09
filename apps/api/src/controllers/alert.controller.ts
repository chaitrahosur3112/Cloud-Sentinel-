import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as service from "../services/alert.service";
import { AlertFilter } from "../dtos/alert.dto";

export const listAlerts = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const { type, status, page, limit } = req.query;

  const filter: AlertFilter = {
    organizationId,
    type:   type   ? String(type)   : undefined,
    status: status ? String(status) : undefined,
    page:   parseInt(String(page  ?? "1"),  10),
    limit:  parseInt(String(limit ?? "20"), 10),
  };

  const result = await service.listAlerts(filter);
  res.status(200).json({ success: true, ...result });
});

export const acknowledgeAlert = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const result = await service.acknowledgeAlert(req.params.id, organizationId);
  res.status(200).json({ success: true, data: result });
});

export const resolveAlert = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const result = await service.resolveAlert(req.params.id, organizationId);
  res.status(200).json({ success: true, data: result });
});