import { Link, Outlet } from "react-router";
import type { Route } from "./+types/PageLayout";
import type { LoaderFunctionArgs } from "react-router";
import { authCookie } from "~/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const id = await authCookie.parse(request.headers.get("Cookie"));
  return { userId: id as string | undefined };
}

function PersonSvg() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-10"
    >
      <path
        fillRule="evenodd"
        d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function UserSvg() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="size-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
      />
    </svg>
  );
}

export function PageLayout({
  userId,
  children,
}: React.PropsWithChildren<{ userId: string | null }>) {
  return (
    <div>
      <nav className="bg-gray-800">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="relative flex h-16 items-center justify-between">
            <div className="flex flex-1 items-stretch justify-start">
              <div className="flex shrink-0 items-center">
                <Link to="/">
                  <img
                    style={{ width: 47 }}
                    className="h-8 w-auto"
                    src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                    alt="Your Company"
                  />
                </Link>
              </div>
              <div className="ml-6">
                <div className="flex space-x-4">
                  {/* <!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" --> */}
                  <Link
                    to="/home"
                    className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white"
                    aria-current="page"
                  >
                    Home
                  </Link>
                </div>
              </div>
            </div>
            <div className="flex items-center ml-6">
              <button
                type="button"
                className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden"
              >
                <span className="sr-only">View notifications</span>
                <svg
                  className="size-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                  data-slot="icon"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                  />
                </svg>
              </button>

              {/* <!-- Profile dropdown --> */}
              <div className="relative ml-3">
                <div
                  style={{
                    ["anchorName" as string]: "--user-menu-anchor",
                  }}
                >
                  {userId ? (
                    <button
                      type="button"
                      className="relative flex rounded-full bg-gray-800 text-sm focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden"
                      id="user-menu-button"
                      aria-expanded="false"
                      aria-haspopup="true"
                      popoverTarget="user-menu-popover"
                    >
                      <span className="sr-only">Open user menu</span>
                      <div className="[color:var(--color-gray-200)]">
                        <PersonSvg />
                      </div>
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="text-sm [color:var(--color-gray-200)] [display:grid] [justify-items:center]"
                    >
                      <UserSvg />
                      Login
                    </Link>
                  )}
                </div>

                {/* <!--
              Dropdown menu, show/hide based on menu state.

              Entering: "transition ease-out duration-100"
                From: "transform opacity-0 scale-95"
                To: "transform opacity-100 scale-100"
              Leaving: "transition ease-in duration-75"
                From: "transform opacity-100 scale-100"
                To: "transform opacity-0 scale-95"
            --> */}
                <div
                  id="user-menu-popover"
                  popover="auto"
                  className="z-10 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-hidden"
                  style={{
                    position: "fixed",
                    ["positionAnchor" as string]: "--user-menu-anchor",
                    ["positionArea" as string]: "bottom span-left",
                  }}
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu-button"
                >
                  {/* <!-- Active: "bg-gray-100 outline-hidden", Not Active: "" --> */}
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700"
                    role="menuitem"
                    id="user-menu-item-0"
                  >
                    Your Profile
                  </a>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700"
                    role="menuitem"
                    id="user-menu-item-1"
                  >
                    Settings
                  </a>
                  <form method="post" action="/logout">
                    <button
                      className="block px-4 py-2 text-sm text-gray-700"
                      role="menuitem"
                      id="user-menu-item-2"
                    >
                      Sign out
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}

export default function PageLayoutRoute({ loaderData }: Route.ComponentProps) {
  const { userId } = loaderData;
  return (
    <PageLayout userId={userId || null}>
      <Outlet />
    </PageLayout>
  );
}
