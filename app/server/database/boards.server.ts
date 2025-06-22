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

async function assertUserBoard({
  userId,
  boardId,
}: {
  userId: string;
  boardId: number;
}) {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
  });
  invariant(board?.accountId === userId, "Board not found");
}

export async function renameBoard({
  userId,
  boardId,
  name,
}: {
  userId: string;
  boardId: number;
  name: string;
}) {
  await assertUserBoard({ userId, boardId });
  await prisma.board.update({
    where: { id: boardId },
    data: { name },
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
    include: { columns: { include: { items: true } } },
  });
  return board;
}

export async function createBoardColumn({
  name,
  id,
  boardId,
  userId,
}: {
  name: string;
  id: string;
  boardId: number;
  userId: string;
}) {
  const board = await getUserBoard({ userId, boardId });
  invariant(board, "Board not found");
  invariant(board.accountId === userId, "Board not found");
  return prisma.column.create({ data: { id, name, boardId } });
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
  return column;
}

async function assertUserItem({
  userId,
  itemId,
}: {
  userId: string;
  itemId: string;
}) {
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: { Board: { select: { accountId: true } } },
  });
  invariant(item?.Board.accountId === userId, "Item not found");
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

export async function createColumnItem({
  userId,
  columnId,
  id,
  title,
}: {
  userId: string;
  columnId: string;
  id: string;
  title: string;
}) {
  const column = await assertUserColumn({ userId, columnId });

  return prisma.item.create({
    data: { id, title, columnId, boardId: column.boardId, order: 0 },
  });
}

export async function renameColumnItem({
  userId,
  itemId,
  title,
}: {
  userId: string;
  itemId: string;
  title: string;
}) {
  await assertUserItem({ userId, itemId });
  return prisma.item.update({
    where: { id: itemId },
    data: { title },
  });
}

export async function deleteColumnItem({
  userId,
  itemId,
}: {
  userId: string;
  itemId: string;
}) {
  await assertUserItem({ userId, itemId });
  return prisma.item.delete({ where: { id: itemId } });
}
