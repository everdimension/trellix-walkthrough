import invariant from "tiny-invariant";
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

export async function createBoardColumn({
  name,
  boardId,
  userId,
}: {
  name: string;
  boardId: number;
  userId: string;
}) {
  const board = await getUserBoard({ userId, boardId });
  invariant(board, "Board not found");
  invariant(board.accountId === userId, "Board not found");
  return prisma.column.create({ data: { name, boardId } });
}

async function assertUserColumn({
  userId,
  columnId,
}: {
  userId: string;
  columnId: string;
}) {
  const column = await prisma.column.findUnique({
    where: { id: columnId },
    include: { Board: { select: { accountId: true } } },
  });
  invariant(column?.Board.accountId === userId, "Column not found");
}

export async function deleteBoardColumn({
  userId,
  columnId,
}: {
  userId: string;
  columnId: string;
}) {
  await assertUserColumn({ userId, columnId });
  return prisma.column.delete({ where: { id: columnId } });
}

export async function renameBoardColumn({
  userId,
  columnId,
  name,
}: {
  userId: string;
  columnId: string;
  name: string;
}) {
  await assertUserColumn({ userId, columnId });
  return prisma.column.update({
    where: { id: columnId },
    data: { name },
  });
}
