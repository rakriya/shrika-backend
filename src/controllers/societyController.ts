import { ALLOWED_PERMISSIONS, SALT_ROUNDS } from "./../constants/index";
import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import logger from "../config/logger";
import createHttpError from "http-errors";
import { getBcrypt } from "../config/bcrypt";
const prisma = new PrismaClient();

export const createSociety = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;

    // Validate input data
    if (!name || name.trim() === "") {
      return next(createHttpError(400, "All fields are required"));
    }

    // Check if society already exists
    const societyExists = await prisma.society.findUnique({ where: { name } });
    if (societyExists) {
      return next(createHttpError(400, `Society already exists with name: ${name}`));
    }

    // Logic to create a new society in the database
    const newSociety = await prisma.society.create({
      data: {
        name,
      },
    });

    logger.info("Society created successfully", newSociety);
    res.status(201).json({ message: "Society created successfully", newSociety });
  } catch (error) {
    return next(error);
  }
};

export const getAllSocieties = async (req: Request, res: Response) => {
  try {
    // Logic to fetch all societies from the database
    const societies = await prisma.society.findMany();
    res.status(200).json(societies);
  } catch (error) {
    res.status(500).json({ message: "Error fetching societies", error });
  }
};

export const getSocietyById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Logic to fetch a society by ID from the database
    const society = await prisma.society.findUnique({ where: { id } });
    if (!society) {
      return next(createHttpError(400, `No society found with the provided ID: ${id}.`));
    }
    res.status(200).json(society);
  } catch (error) {
    res.status(500).json({ message: "Error fetching society", error });
  }
};

export const setupSociety = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { societyName, adminName, adminPhone, adminEmail, adminPassword } = req.body;

    // Check for existing society
    const existingSociety = await prisma.society.findUnique({
      where: { name: societyName },
    });
    if (existingSociety) {
      return next(createHttpError(409, "Society name already taken."));
    }

    // Hash the admin password
    const bcrypt = await getBcrypt();
    const hashedPassword = await bcrypt.hash(adminPassword, SALT_ROUNDS);

    const result = await prisma.$transaction(async (tx) => {
      const newSociety = await tx.society.create({
        data: { name: societyName },
      });

      const adminRole = await tx.role.create({
        data: {
          name: "Super Admin",
          permissions: [...ALLOWED_PERMISSIONS],
          societyId: newSociety.id,
        },
      });

      const firstMember = await tx.member.create({
        data: {
          name: adminName,
          email: adminEmail,
          phoneNumber: adminPhone,
          password: hashedPassword,
          roleId: adminRole.id,
          societyId: newSociety.id,
        },
      });

      return { newSociety, firstMember };
    });

    logger.info(`✅ Society setup complete for: ${result.newSociety.name}`);

    res.status(201).json({
      message: "Society setup successful",
      society: {
        id: result.newSociety.id,
        name: result.newSociety.name,
      },
      admin: {
        id: result.firstMember.id,
        name: result.firstMember.name,
        email: result.firstMember.email,
        phoneNumber: result.firstMember.phoneNumber,
      },
    });
  } catch (error) {
    return next(error);
  }
};
