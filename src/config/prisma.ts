import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  omit: {
    member: {
      password: true,
    },
  },
});

export default prisma; // Use this single instance in your app
