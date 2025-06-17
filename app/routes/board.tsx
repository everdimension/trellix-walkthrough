import { ContentColumn } from "~/components/ContentColumn";
import type { Route } from "./+types/board";
import { requireUserSession } from "~/auth.server";
import type { LoaderFunctionArgs } from "react-router";
import { getUserBoard } from "~/server/database/boards.server";
import { TextButton } from "~/components/Button";

export async function loader({
  request,
  params: { boardId },
}: LoaderFunctionArgs) {
  const userId = await requireUserSession(request);
  const board = await getUserBoard({ userId, boardId: Number(boardId) });
  if (!board) {
    throw new Response(null, { status: 404 });
  }
  return { board };
}

export default function Board({ loaderData: { board } }: Route.ComponentProps) {
  return (
    <ContentColumn className="page-top">
      <div className="grid gap-[40px]">
        <h2
          className="text-2xl"
          style={{ borderBottom: `2px solid ${board.color}` }}
        >
          {board.name}
        </h2>
        {board.columns.length ? (
          <div style={{ display: "flex", gap: 20 }}>
            {board.columns.map((column) => column.name)}
          </div>
        ) : null}
        <div>
          <TextButton paddingInline={0}>New Column</TextButton>
        </div>
      </div>
    </ContentColumn>
  );
}
