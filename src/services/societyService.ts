import prisma from "../config/prisma";

export const getSocietyDataByID = async (id: string) => {
  await prisma.society.findUnique({ where: { id } });
};
