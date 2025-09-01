// Lightweight structured logger (swap for pino/winston later if needed)
export const log = {
  info: (msg: string, meta?: unknown) => console.log(`[INFO] ${msg}`, meta ?? ""),
  warn: (msg: string, meta?: unknown) => console.warn(`[WARN] ${msg}`, meta ?? ""),
  error: (msg: string, meta?: unknown) => console.error(`[ERROR] ${msg}`, meta ?? ""),
};
