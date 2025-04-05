import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import logger from "../config/logger";
import createHttpError from "http-errors";
const prisma = new PrismaClient();

interface ff extends Request {
  body: {
    name: string;
  };
}

export const createSociety = async (req: ff, res: Response, next: NextFunction) => {
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
