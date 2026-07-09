import { NextFunction, Request, Response } from "express";

type AsyncRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

// Express doesn't automatically catch rejected promises from async route
// handlers — without this, a thrown error inside an `async` controller just
// hangs the request instead of reaching errorHandler.ts. Wrap every async
// controller in this, e.g.: router.get("/x", asyncHandler(myController))
export function asyncHandler(handler: AsyncRouteHandler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    handler(req, res, next).catch(next);
  };
}
