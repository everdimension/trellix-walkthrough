import { prisma } from "./prisma.server";
import bcrypt from "bcrypt";

export async function accountExists(email: string) {
  const account = await prisma.account.findFirst({ where: { email } });
  return Boolean(account);
}

export async function createAccount({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  const user = await prisma.account.create({
    data: {
      email,
      Password: { create: { hash, salt } },
    },
  });
  return user;
}

export async function login(email: string, password: string) {
  const user = await prisma.account.findUnique({
    where: { email },
    include: { Password: true },
  });
  if (!user) throw new Error("User not found");
  if (!user.Password) {
    throw new Error("Internal db error");
  }
  const passwordIsCorrect = await bcrypt.compare(password, user.Password.hash);
  if (!passwordIsCorrect) {
    throw new Error("Incorrect password");
  }
  return { id: user.id };
}
