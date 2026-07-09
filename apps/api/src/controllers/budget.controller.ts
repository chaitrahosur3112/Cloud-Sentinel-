import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as service from "../services/budget.service";
import { CreateBudgetDto, UpdateBudgetDto } from "../dtos/budget.dto";

export const createBudget = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const result = await service.createBudget(organizationId, req.body as CreateBudgetDto);
  res.status(201).json({ success: true, data: result });
});

export const listBudgets = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const result = await service.listBudgets(organizationId);
  res.status(200).json({ success: true, data: result });
});

export const getBudget = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const result = await service.getBudget(req.params.id, organizationId);
  res.status(200).json({ success: true, data: result });
});

export const updateBudget = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const result = await service.updateBudget(req.params.id, organizationId, req.body as UpdateBudgetDto);
  res.status(200).json({ success: true, data: result });
});

export const deleteBudget = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const result = await service.deleteBudget(req.params.id, organizationId);
  res.status(200).json({ success: true, data: result });
});