import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma; // Use this single instance in your app
