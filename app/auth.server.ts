import { createCookie } from "react-router";
import invariant from "tiny-invariant";
import { accountExistsById } from "./server/database/account.server";

const COOKIE_SECRET = process.env.COOKIE_SECRET || "";
invariant(COOKIE_SECRET, "COOKIE_SECRET not set");

/** 1 hour in seconds */
const ONE_HOUR_S = 1 * 60 * 60;
/**
 * 400 days in seconds
 *
 * Chrome has an upper limit for cookie max-age:
 * 1. https://httpwg.org/http-extensions/draft-ietf-httpbis-rfc6265bis.html#name-cookie-lifetime-limits
 * 2. https://developer.chrome.com/blog/cookie-max-age-expires
 * 3. https://chromestatus.com/feature/4887741241229312
 */
const COOKIE_MAX_AGE = 400 * 24 * 60 * 60;

export const authCookie = createCookie("auth", {
  httpOnly: true,
  secrets: [COOKIE_SECRET],
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge:
    process.env.NODE_ENV === "production" ? COOKIE_MAX_AGE : 2 * ONE_HOUR_S,
  path: "/",
});

export async function requireUserSession(request: Request) {
  const userId = await authCookie.parse(request.headers.get("Cookie"));
  const user = userId ? await accountExistsById(userId) : null;
  if (!user) {
    const response = new Response(null, {
      status: 401,
      statusText: "Unauthorized",
    });
    throw response;
  }
  return userId as string;
}
