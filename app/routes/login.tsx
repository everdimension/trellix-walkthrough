import { getError } from "get-error";
import {
  data,
  Form,
  Link,
  redirect,
  type ActionFunctionArgs,
} from "react-router";
import { authCookie } from "~/auth.server";
import { login } from "~/server/database/account.server";
import type { Route } from "./+types/login";
import { Input } from "~/components/Input";
import { Button } from "~/components/Button";

function validate(data: { email: string; password: string }) {
  let errors: { email?: string; password?: string } = {};
  if (!data.email) {
    errors.email = "You must provide an email address";
  } else if (!data.email?.includes("@")) {
    errors.email = "Invalid email";
  }

  if (!data.password) {
    errors.password = "You must provide a password";
  }

  return Object.keys(errors).length ? errors : null;
}

export const meta = () => {
  return [{ title: "Trellix Login" }];
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const errors = validate({ email, password });
  if (errors) {
    return data({ errors }, { status: 400 });
  }
  try {
    const { id } = await login(email, password);
    return redirect("/home", {
      headers: {
        "Set-Cookie": await authCookie.serialize(id),
      },
    });
  } catch (error) {
    return data({
      errors: {
        email: undefined,
        password: getError(error, new Error("Incorrect password")).message,
      },
    });
  }
}

export default function Login({ actionData }: Route.ComponentProps) {
  const errors = actionData?.errors;
  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          className="mx-auto h-10 w-auto"
          src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
          alt="Your Company"
        />
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <Form className="grid gap-[30px]" action="#" method="POST">
          <div>
            <label htmlFor="email" className="block text-sm/6 font-medium">
              Email address{" "}
              {errors?.email ? (
                <span className="text-red-500">{errors.email}</span>
              ) : null}
            </label>
            <div className="mt-2">
              <Input
                type="email"
                name="email"
                id="email"
                autoComplete="email"
                required
                className="block w-full rounded-md px-3 py-1.5 text-base outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm/6 font-medium">
                Password{" "}
                {errors?.password ? (
                  <span className="text-red-500">{errors.password}</span>
                ) : null}
              </label>
              <div className="text-sm">
                <a
                  href="#"
                  className="font-semibold text-indigo-600 hover:text-indigo-500"
                >
                  Forgot password?
                </a>
              </div>
            </div>
            <div className="mt-2">
              <Input
                type="password"
                name="password"
                id="password"
                autoComplete="current-password"
                required
                className="block w-full rounded-md px-3 py-1.5 text-base outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              />
            </div>
          </div>

          <Button type="submit" className="py-1.5">
            Sign in
          </Button>
        </Form>

        <p className="mt-10 text-center text-sm/6 text-gray-500">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-semibold text-indigo-600 hover:text-indigo-500"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
