import {
  Form,
  Link,
  redirect,
  useNavigation,
  type LoaderFunctionArgs,
} from "react-router";
import { requireUserSession } from "~/auth.server";
import { ContentColumn } from "../components/ContentColumn";
import React, { useId } from "react";
import { TextButton } from "~/components/Button";
import type { ActionFunctionArgs } from "react-router";
import { createBoard, getUserBoards } from "~/server/database/boards.server";
import type { Route } from "./+types/home";
import type { Board } from "generated/prisma";
import { Input } from "../components/Input";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserSession(request);
  const userBoards = await getUserBoards({ userId });
  return { boards: userBoards };
}

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserSession(request);
  const formData = await request.formData();
  const name = String(formData.get("name"));
  const color = String(formData.get("color"));
  if (!name) {
    throw new Response(null, { status: 400 });
  }
  const board = await createBoard({ userId, name, color });
  return redirect(`/boards/${board.id}`);
}

function LabelledInput({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: React.ReactNode;
}) {
  const id = useId();
  return (
    <div className="grid gap-[10px]">
      <label htmlFor={id} className="block text-sm/6 font-medium">
        {label}
      </label>
      <Input id={id} {...props} />
    </div>
  );
}

function NewBoardForm() {
  const navigation = useNavigation();
  const isLoading = navigation.formData?.get("intent") === "createBoard";
  return (
    <Form method="POST">
      <input type="hidden" name="intent" value="createBoard" />
      <div style={{ display: "grid", gap: 16, maxWidth: 400 }}>
        <LabelledInput
          label="Name"
          type="text"
          name="name"
          placeholder="board name"
          required={true}
        />
        <div>
          <label style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span>Color</span>{" "}
            <input type="color" name="color" defaultValue="#e3e3e3" />
          </label>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <TextButton disabled={isLoading}>
            {isLoading ? "Creating..." : "Create"}
          </TextButton>
        </div>
      </div>
    </Form>
  );
}

function BoardList({ boards }: { boards: Board[] }) {
  return (
    <div style={{ display: "grid", gap: 20 }}>
      {boards.map((board) => (
        <Link
          to={`/boards/${board.id}`}
          className="group [background-color:var(--z-index-1)] rounded-[8px] py-2 px-3"
        >
          <div className="[color:var(--neutral-300)] text-xs">A Board</div>
          <span className="text-blue-500 group-hover:underline">
            {board.name}
          </span>
        </Link>
      ))}
    </div>
  );
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { boards } = loaderData;
  return (
    <ContentColumn className="page-top">
      <div style={{ display: "grid", gap: 40 }}>
        <NewBoardForm />
        <div style={{ display: "grid", gap: 20 }}>
          <h2>Boards</h2>

          {boards.length ? (
            <BoardList boards={boards} />
          ) : (
            <p style={{ color: "var(--neutral-500)" }}>No boards created yet</p>
          )}
        </div>
      </div>
    </ContentColumn>
  );
}
