import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("./components/PageLayout.tsx", [
    index("routes/home.tsx"),
    route("/signup", "routes/signup.tsx"),
    route("/login", "routes/login.tsx"),
  ]),
] satisfies RouteConfig;
