import { createCookie } from "react-router";
import invariant from "tiny-invariant";

const COOKIE_SECRET = process.env.COOKIE_SECRET || "";
invariant(COOKIE_SECRET, "COOKIE_SECRET not set");

export const authCookie = createCookie("auth", {
  httpOnly: true,
  secrets: [COOKIE_SECRET],
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 10,
  path: "/",
});
