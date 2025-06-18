import type { Column } from "generated/prisma";
import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import type { HTMLFormMethod } from "react-router";
import { useFetcher } from "react-router";
import invariant from "tiny-invariant";
import { requireUserSession } from "~/auth.server";
import { TextButton } from "~/components/Button";
import { ContentColumn } from "~/components/ContentColumn";
import { Input } from "~/components/Input";
import {
  createBoardColumn,
  deleteBoardColumn,
  getUserBoard,
  renameBoardColumn,
} from "~/server/database/boards.server";
import type { Route } from "./+types/board";
import { ensure } from "~/shared/ensure";

function TrashIcon(props: React.SVGAttributes<SVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
      />
    </svg>
  );
}

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

export async function action({ request }: ActionFunctionArgs) {
  const url = new URL(request.url);
  const userId = await requireUserSession(request);
  const formData = await request.formData();
  const intent = url.searchParams.get("intent");
  const model = url.searchParams.get("model");

  invariant(model, "model is a required parameter: column | board");
  invariant(intent, "intent is a required parameter");

  switch (`${model}-${intent}`) {
    case "column-create": {
      const name = String(formData.get("name"));
      const boardId = Number(formData.get("boardId"));
      const column = await createBoardColumn({ userId, boardId, name });
      return column;
    }
    case "column-delete": {
      const columnId = String(formData.get("columnId"));
      return deleteBoardColumn({ userId, columnId });
    }
    case "column-rename": {
      const columnId = String(formData.get("columnId"));
      const name = String(formData.get("name"));
      return renameBoardColumn({ userId, columnId, name });
    }
    default: {
      throw new Error("Invalid request");
    }
  }
}

function Column({ style, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      style={{
        background: "var(--neutral-200)",
        padding: 10,
        borderRadius: 12,
        border: "1px solid var(--neutral-300)",
        minWidth: "15rem",
        ...style,
      }}
      {...props}
    />
  );
}

function RemoveColumnButton({
  boardId,
  columnId,
}: {
  boardId: number;
  columnId: string;
}) {
  const deleteColumnFetcher = useFetcher();
  return (
    <deleteColumnFetcher.Form
      method="post"
      action={`/boards/${boardId}?model=column&intent=delete`}
    >
      <input type="hidden" name="columnId" value={columnId} />
      <button
        aria-label="Delete Column"
        className="hover:text-blue-500"
        disabled={deleteColumnFetcher.formData?.get("columnId") === columnId}
      >
        {deleteColumnFetcher.formData?.get("columnId") === columnId ? (
          "deleting..."
        ) : (
          <TrashIcon style={{ width: 16 }} />
        )}
      </button>
    </deleteColumnFetcher.Form>
  );
}

function ColumnName({
  boardId,
  column,
  style,
}: {
  boardId: number;
  column: Column;
  style?: React.CSSProperties;
}) {
  const fetcher = useFetcher();
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  return editing ? (
    <fetcher.Form
      className="w-full"
      method="post"
      action={`/boards/${boardId}?model=column&intent=rename`}
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        fetcher.submit(form, {
          action: ensure(form.getAttribute("action")),
          method: ensure(form.getAttribute("method")) as HTMLFormMethod,
          flushSync: true,
        });
        flushSync(() => {
          setEditing(false);
        });
        buttonRef.current?.focus();
      }}
    >
      <input type="hidden" name="columnId" value={column.id} />
      <Input
        ref={inputRef}
        name="name"
        defaultValue={column.name}
        className="py-0! px-1! ml-[-0.25rem]"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setEditing(false);
          }
        }}
        onBlur={() => {
          setEditing(false);
        }}
      />
    </fetcher.Form>
  ) : (
    <button
      ref={buttonRef}
      className="text-sm/6 px-1 ml-[-0.25rem]"
      onClick={() => {
        flushSync(() => {
          setEditing(true);
        });
        inputRef.current?.select();
      }}
      style={{ width: "100%", textAlign: "start", ...style }}
    >
      {fetcher.formData?.get("name")?.toString() ?? column.name}
    </button>
  );
}

export default function Board({ loaderData: { board } }: Route.ComponentProps) {
  const newColumnFetcher = useFetcher();
  return (
    <div className="grid gap-[40px] page-top">
      <ContentColumn className="mx-0!">
        <h2
          className="text-2xl"
          style={{ borderBottom: `2px solid ${board.color}` }}
        >
          {board.name}
        </h2>
      </ContentColumn>
      <div
        className="px-4 py-2"
        style={{ display: "flex", gap: 20, overflowX: "auto" }}
      >
        {board.columns.map((column) => (
          <Column key={column.id}>
            <div className="grid gap-[20px]">
              <div className="grid [grid-template-columns:1fr_auto] justify-items-start">
                <ColumnName
                  boardId={board.id}
                  column={column}
                  style={{ color: "var(--neutral-400)" }}
                />
                <RemoveColumnButton boardId={board.id} columnId={column.id} />
              </div>
              <div>
                <TextButton paddingInline={0}>Add Card</TextButton>
              </div>
            </div>
          </Column>
        ))}

        <Column
          style={{
            minWidth: "10rem",
          }}
        >
          <newColumnFetcher.Form
            className="grid gap-[6px]"
            method="post"
            action={`/boards/${board.id}?model=column&intent=create`}
            onSubmit={(event) => {
              event.preventDefault();
              const form = event.currentTarget;
              newColumnFetcher.submit(form, {
                action: ensure(form.getAttribute("action")),
                method: ensure(form.getAttribute("method")) as HTMLFormMethod,
                flushSync: true,
              });
              event.currentTarget.reset();
            }}
          >
            <input type="hidden" name="boardId" value={board.id} />
            <Input
              type="text"
              name="name"
              placeholder="column name"
              required={true}
            />

            <div>
              <TextButton paddingInline={0}>
                {newColumnFetcher.formData ? "Creating..." : "New Column"}
              </TextButton>
            </div>
          </newColumnFetcher.Form>
        </Column>
      </div>
    </div>
  );
}
