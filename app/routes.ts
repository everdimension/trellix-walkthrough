import {
  type RouteConfig,
  index,
  layout,
  route,

} from "@react-router/dev/routes";

export default [
  layout("./components/PageLayout.tsx", [
    index("routes/index.tsx"),
    route("/signup", "routes/signup.tsx"),
    route("/login", "routes/login.tsx"),
    route("/logout", "routes/logout.ts"),
    route("/home", "routes/home.tsx"),
    route("/boards/:boardId", "routes/board.tsx"),
  ]),
] satisfies RouteConfig;
