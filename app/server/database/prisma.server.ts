import { PrismaClient } from "@prisma-app/client";

export const prisma = new PrismaClient();

process.on("beforeExit", () => {
  prisma.$disconnect();
});
