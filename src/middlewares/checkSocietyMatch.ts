import { NextFunction, Response } from "express";
import { IAuthRequest } from "../types";
import createHttpError from "http-errors";

export const checkSocietyMatch = (req: IAuthRequest, res: Response, next: NextFunction) => {
  const { member } = req;
  const { societyId } = req.params;

  if (!member || !societyId || member.societyId !== societyId) {
    return next(createHttpError(403, "Access denied for this society."));
  }

  next();
};
