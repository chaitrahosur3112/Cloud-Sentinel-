import { RoleName } from "@prisma/client";

export {};

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        organizationId: string;
        role: RoleName;
      };
    }
  }
}