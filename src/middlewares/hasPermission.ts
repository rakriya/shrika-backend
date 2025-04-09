import { NextFunction, Response } from "express";
import { Permission } from "../constants";
import createHttpError from "http-errors";
import { IAuthRequest } from "../types";

const hasPermission = (permission: Permission) => {
  return async (req: IAuthRequest, res: Response, next: NextFunction) => {
    try {
      const member = req.member;

      const memberPermissions = member.isCustomPermissionsEnabled
        ? member.customPermissions
        : member.role?.permissions;

      if (!memberPermissions || !Array.isArray(memberPermissions)) {
        return next(createHttpError(403, "Access denied: no permissions found"));
      }

      if (!memberPermissions.includes(permission)) {
        return next(
          createHttpError(403, `Access denied: missing required permission '${permission}'`),
        );
      }

      next();
    } catch (error) {
      next(createHttpError(500, "Authorization check failed", { cause: error }));
    }
  };
};

export default hasPermission;
