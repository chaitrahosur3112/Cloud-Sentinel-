// A tiny wrapper around console, not a dependency like winston/pino yet.
// Why bother wrapping console at all? Because every call site says
// logger.info(...) instead of console.log(...) — if we swap to a real
// logging library later, this is the only file that changes.

function timestamp(): string {
  return new Date().toISOString();
}

export const logger = {
  info: (message: string) => console.log(`[${timestamp()}] INFO  ${message}`),
  warn: (message: string) => console.warn(`[${timestamp()}] WARN  ${message}`),
  error: (message: string) => console.error(`[${timestamp()}] ERROR ${message}`),
};
