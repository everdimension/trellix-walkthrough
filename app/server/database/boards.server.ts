import { prisma } from "./prisma.server";

export async function createBoard({
  userId,
  name,
  color,
}: {
  userId: string;
  name: string;
  color: string;
}) {
  return prisma.board.create({
    data: { accountId: userId, name, color },
  });
}

export async function getUserBoards({ userId }: { userId: string }) {
  const boards = await prisma.board.findMany({
    where: { accountId: userId },
  });
  return boards;
}

export async function getUserBoard({
  userId,
  boardId,
}: {
  userId: string;
  boardId: number;
}) {
  const board = await prisma.board.findUnique({
    where: { accountId: userId, id: boardId },
    include: { columns: true },
  });
  return board;
}
