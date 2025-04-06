import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import logger from "../config/logger";
import createHttpError from "http-errors";
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

export const getSocieties = async (req: Request, res: Response) => {
  try {
    // Logic to fetch all societies from the database
    const societies = await prisma.society.findMany();
    res.status(200).json(societies);
  } catch (error) {
    res.status(500).json({ message: "Error fetching societies", error });
  }
};

export const getSocietyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Logic to fetch a society by ID from the database
    const society = await prisma.society.findUnique({ where: { id } });
    if (!society) {
      return res.status(404).json({ message: "Society not found" });
    }
    res.status(200).json(society);
  } catch (error) {
    res.status(500).json({ message: "Error fetching society", error });
  }
};
