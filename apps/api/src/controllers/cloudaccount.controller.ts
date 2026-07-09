import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as service from "../services/cloudaccount.service";
import { ConnectCloudAccountDto } from "../dtos/resource.dto";

export const connectAccount = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const result = await service.connectAccount(organizationId, req.body as ConnectCloudAccountDto);
  res.status(201).json({ success: true, data: result });
});

export const listAccounts = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const result = await service.listAccounts(organizationId);
  res.status(200).json({ success: true, data: result });
});

export const disconnectAccount = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const result = await service.disconnectAccount(req.params.id, organizationId);
  res.status(200).json({ success: true, data: result });
});