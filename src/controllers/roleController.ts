import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import prisma from "../config/prisma";
import logger from "../config/logger";
import { isValidPermissions } from "../utils/validateValidPermissions";
import { ALLOWED_PERMISSIONS } from "../constants";

export const createRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { societyId } = req.params;
    const { name, permissions } = req.body;

    if (!isValidPermissions(permissions)) {
      return next(
        createHttpError(400, `Permissions must be from: ${ALLOWED_PERMISSIONS.join(", ")}`),
      );
    }

    // Check if society exists
    const society = await prisma.society.findUnique({ where: { id: societyId } });
    if (!society) {
      return next(createHttpError(400, `No society found with the provided ID: ${societyId}.`));
    }

    // Check if the role already exists in this society by name
    const existingRole = await prisma.role.findFirst({
      where: {
        name,
        societyId,
      },
    });
    if (existingRole) {
      return next(
        createHttpError(409, `A Rolw with name "${name}" already exists in "${society.name}".`),
      );
    }

    // Logic to create a new society in the database
    const newRole = await prisma.role.create({
      data: { name, permissions, society: { connect: { id: society.id } } },
    });

    logger.info(`✅ Role "${newRole.name}" created in society "${society.name}".`);

    res.status(201).json({ message: `Role created successfully in ${society.name}`, newRole });
  } catch (error) {
    return next(error);
  }
};
