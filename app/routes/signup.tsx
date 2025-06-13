import type { ActionFunctionArgs } from "react-router";
import { data, Form, Link } from "react-router";
import type { Route } from "./+types/signup";
import { authCookie } from "~/auth.server";
import { redirect } from "react-router";
import { accountExists, createAccount } from "~/server/database/account.server";

export const meta = () => {
  return [{ title: "Trellix Signup" }];
};

async function validate(data: {
  email: string;
  password: string;
  repeatPassword: string;
}) {
  let errors: { email?: string; password?: string } = {};
  if (!data.email) {
    errors.email = "You must provide an email address";
  } else if (!data.email?.includes("@")) {
    errors.email = "Invalid email";
  }

  if (!data.password) {
    errors.password = "You must provide a password";
  } else if (data.password !== data.repeatPassword) {
    errors.password = "Passwords do not match";
  }
  if (!errors.email && (await accountExists(data.email))) {
    errors.email = `User with email ${data.email} already exists`;
  }

  return Object.keys(errors).length ? errors : null;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const repeatPassword = String(formData.get("repeatPassword"));

  const errors = await validate({ email, password, repeatPassword });
  if (errors) {
    return data({ errors }, { status: 400 });
  } else {
    const user = await createAccount({ email, password });
    console.log("redirecting", user);
    return redirect("/", {
      headers: {
        "Set-Cookie": await authCookie.serialize(user.id),
      },
    });
  }
}

export default function Signup({ actionData }: Route.ComponentProps) {
  const errors = actionData?.errors;
  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          className="mx-auto h-10 w-auto"
          src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
          alt="Your Company"
        />
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight [color:var(--text-900)]">
          Create your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <Form className="space-y-6" method="POST">
          <div>
            <label
              htmlFor="email"
              className="block text-sm/6 font-medium [color:var(--text-900)]"
            >
              Email address{" "}
              {errors?.email ? (
                <span className="text-red-500">{errors.email}</span>
              ) : null}
            </label>
            <div className="mt-2">
              <input
                type="email"
                name="email"
                id="email"
                autoComplete="email"
                required
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm/6 font-medium [color:var(--text-900)]"
            >
              Password{" "}
              {errors?.password ? (
                <span className="text-red-500">{errors.password}</span>
              ) : null}
            </label>
            <div className="mt-2">
              <input
                type="password"
                name="password"
                id="password"
                autoComplete="new-password"
                required
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="repeatPassword"
              className="block text-sm/6 font-medium [color:var(--text-900)]"
            >
              Repeat Password
            </label>
            <div className="mt-2">
              <input
                type="password"
                name="repeatPassword"
                id="repeatPassword"
                autoComplete="new-password"
                required
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Sign up
            </button>
          </div>
        </Form>

        <p className="mt-10 text-center text-sm/6 text-gray-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-indigo-600 hover:text-indigo-500"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
