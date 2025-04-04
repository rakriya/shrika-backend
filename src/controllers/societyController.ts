import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import logger from "../config/logger";
const prisma = new PrismaClient();

export const createSociety = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    // Validate input data
    if (!name || name.trim() === "") {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    // Check if society already exists
    const societyExists = await prisma.society.findUnique({ where: { name } });
    if (societyExists) {
      res.status(409).json({ message: "Society already exists" });
      return;
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
    logger.error("Error creating society", error);
    res.status(500).json({ message: "Error creating society", error });
  }
};
