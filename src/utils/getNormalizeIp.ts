import { Request } from "express";

export const generateNormalizeIp = (req: Request) => {
  const normalizeIP = (ip: string) => (ip === "::1" ? "127.0.0.1" : ip);
  return normalizeIP(
    req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() || // Prod via Nginx
      req.socket.remoteAddress || // Dev directly
      "",
  );
};
