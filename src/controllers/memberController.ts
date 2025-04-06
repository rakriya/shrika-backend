import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import prisma from "../config/prisma";
import logger from "../config/logger";
import { isValidPermissions } from "../utils/validateValidPermissions";
import { ALLOWED_PERMISSIONS } from "../constants";

export const createMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { societyId } = req.params;
    const { name, email, password, cpassword, phoneNumber, customPermissions } = req.body;

    if (password !== cpassword) {
      return next(createHttpError(400, "Password and Confirm Password do not match."));
    }

    const isCustomPermissionsEnabled =
      Array.isArray(customPermissions) && customPermissions.length > 0;

    if (isCustomPermissionsEnabled && !isValidPermissions(customPermissions)) {
      return next(
        createHttpError(400, `Permissions must be from: ${ALLOWED_PERMISSIONS.join(", ")}`),
      );
    }

    // Check if society already exists
    const society = await prisma.society.findUnique({ where: { id: societyId } });
    if (!society) {
      return next(createHttpError(400, `No society found with the provided ID: ${societyId}.`));
    }

    // Check if the member already exists in this society byphone number
    const existingMember = await prisma.member.findFirst({
      where: {
        phoneNumber,
        societyId,
      },
    });
    if (existingMember) {
      return next(
        createHttpError(
          409,
          `A member with phone number "${phoneNumber}" already exists in "${society.name}".`,
        ),
      );
    }

    // Logic to create a new society in the database
    const newMember = await prisma.member.create({
      data: {
        name,
        email,
        password,
        phoneNumber,
        isCustomPermissionsEnabled,
        customPermissions,
        society: { connect: { id: society.id } },
      },
    });

    logger.info(
      `✅ Member "${newMember.name}" (Phone: ${newMember.phoneNumber}) created in society "${society.name}".`,
    );

    res.status(201).json({ message: `Member created successfully in ${society.name}`, newMember });
  } catch (error) {
    return next(error);
  }
};
