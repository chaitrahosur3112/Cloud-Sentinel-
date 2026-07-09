// Plain `throw new Error("not found")` loses the HTTP status code by the
// time it reaches the error handler. AppError carries the status code with
// it, so controllers/services can throw something specific and the error
// handler knows exactly how to respond.

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
