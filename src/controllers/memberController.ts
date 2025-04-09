import { Response, NextFunction } from "express";
import createHttpError from "http-errors";
import prisma from "../config/prisma";
import logger from "../config/logger";
import { isValidPermissions } from "../utils/validateValidPermissions";
import { ALLOWED_PERMISSIONS, SALT_ROUNDS } from "../constants";
import { getBcrypt } from "../config/bcrypt";
import { IAuthRequest } from "../types";

export const createMember = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { societyId } = req.params;

    if (req.member.societyId !== societyId) {
      return next(createHttpError(403, "You can't create a member in another society."));
    }

    const {
      name,
      email,
      password,
      cpassword,
      phoneNumber,
      customPermissions = [],
      roleTemplateId,
    } = req.body;

    // Validate password match
    if (password !== cpassword) {
      return next(createHttpError(400, "Password and Confirm Password do not match."));
    }

    // Check permission source
    const isCustomPermissionsEnabled = customPermissions.length > 0;

    if (!isCustomPermissionsEnabled && !roleTemplateId) {
      return next(
        createHttpError(400, "Member must have either a custom permission set or a role template."),
      );
    }

    // Validate custom permissions if provided
    if (isCustomPermissionsEnabled && !isValidPermissions(customPermissions)) {
      return next(
        createHttpError(400, `Permissions must be from: ${ALLOWED_PERMISSIONS.join(", ")}`),
      );
    }

    // Load role if needed
    let role = null;
    if (!isCustomPermissionsEnabled && roleTemplateId) {
      role = await prisma.role.findUnique({ where: { id: roleTemplateId } });
      if (!role) {
        return next(createHttpError(400, `No role found with the provided ID: ${roleTemplateId}.`));
      }
    }

    // Check if society exists
    const society = await prisma.society.findUnique({ where: { id: societyId } });
    if (!society) {
      return next(createHttpError(400, `No society found with the provided ID: ${societyId}.`));
    }

    // Check for duplicate phone number
    const existingMember = await prisma.member.findFirst({
      where: { phoneNumber, societyId },
    });
    if (existingMember) {
      return next(
        createHttpError(
          409,
          `A member with phone number "${phoneNumber}" already exists in "${society.name}".`,
        ),
      );
    }

    // Hash password
    const bcrypt = await getBcrypt();
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create member
    const newMember = await prisma.member.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phoneNumber,
        isCustomPermissionsEnabled,
        customPermissions,
        society: { connect: { id: society.id } },
        ...(role && { role: { connect: { id: role.id } } }),
      },
    });

    logger.info(
      `✅ Member "${newMember.name}" (Phone: ${newMember.phoneNumber}) created in society "${society.name}".`,
    );

    res.status(201).json({
      message: `Member "${newMember.name}" created successfully in "${society.name}"`,
      newMember,
    });
  } catch (error) {
    return next(error);
  }
};
