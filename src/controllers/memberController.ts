import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import prisma from "../config/prisma";
import logger from "../config/logger";

export const createMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { societyId } = req.params;
    const { name, email, password, cpassword, phoneNumber } = req.body;

    if (password !== cpassword) {
      return next(createHttpError(400, "Password and Confirm Password do not match."));
    }

    // Check if society already exists
    const society = await prisma.member.findUnique({ where: { id: societyId } });
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
      data: { name, email, password, phoneNumber, society: { connect: { id: society.id } } },
    });

    logger.info(`✅ Member "${newMember.name}" created in society "${society.name}".`);

    res.status(201).json({ message: `Member created successfully in ${society.name}`, newMember });
  } catch (error) {
    return next(error);
  }
};
