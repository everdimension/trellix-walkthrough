import { redirect } from "react-router";
import { authCookie } from "~/auth.server";

export async function action() {
  return redirect("/", {
    headers: {
      "Set-Cookie": await authCookie.serialize("", { maxAge: 0 }),
    },
  });
}
