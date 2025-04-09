import createHttpError from "http-errors";
import env from "../config/dotenv";
import { NextFunction, Request, RequestHandler, Response } from "express";

export const requireDevTeamAccess: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (env.NODE_ENV === "development") return next();
  const token = req.headers["x-skrika-access"];
  const expected = env.SHRIKA_TEAM_ACCESS_TOKEN;

  if (!token || token !== expected) {
    return next(createHttpError(403, "Access denied: Dev team only"));
  }

  next();
};
