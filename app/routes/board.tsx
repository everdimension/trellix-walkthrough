import type { Column, Item } from "generated/prisma";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import type { HTMLFormMethod } from "react-router";
import { useFetcher, useFetchers } from "react-router";
import invariant from "tiny-invariant";
import { requireUserSession } from "~/auth.server";
import { TextButton } from "~/components/Button";
import { ContentColumn } from "~/components/ContentColumn";
import { Input } from "~/components/Input";
import {
  createBoardColumn,
  createColumnItem,
  deleteBoardColumn,
  deleteColumnItem,
  getUserBoard,
  renameBoard,
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
  const method = url.searchParams.get("method");

  invariant(method, "method is a required parameter");

  switch (method) {
    case "renameBoard": {
      const name = String(formData.get("name"));
      const boardId = Number(formData.get("boardId"));
      return await renameBoard({ userId, boardId, name });
    }
    case "createBoardColumn": {
      const name = String(formData.get("name"));
      const boardId = Number(formData.get("boardId"));
      const id = ensure(formData.get("id")?.toString());
      const column = await createBoardColumn({ userId, boardId, id, name });
      return column;
    }
    case "deleteBoardColumn": {
      const columnId = String(formData.get("columnId"));
      return deleteBoardColumn({ userId, columnId });
    }
    case "renameBoardColumn": {
      const columnId = String(formData.get("columnId"));
      const name = String(formData.get("name"));
      return renameBoardColumn({ userId, columnId, name });
    }
    case "createColumnItem": {
      const columnId = String(formData.get("columnId"));
      const title = String(formData.get("title"));
      return createColumnItem({ userId, columnId, title });
    }
    case "deleteColumnItem": {
      const itemId = String(formData.get("itemId"));
      return deleteColumnItem({ userId, itemId });
    }
    default: {
      throw new Error("Invalid request");
    }
  }
}

function ColumnWrapper({
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
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
      action={`/boards/${boardId}?method=deleteBoardColumn`}
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

function Editable({
  action,
  name,
  defaultValue,
  inputClassName,
  buttonClassName,
  buttonStyle,
  hiddenFormData,
}: {
  action: string;
  name: string;
  defaultValue: string;
  inputClassName?: string;
  buttonClassName?: string;
  buttonStyle?: React.CSSProperties;
  hiddenFormData: Array<{ name: string; value: string }>;
}) {
  const fetcher = useFetcher();
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  return editing ? (
    <fetcher.Form
      className="w-full"
      method="post"
      action={action}
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
      {hiddenFormData.map((entry) => (
        <input
          key={entry.name}
          type="hidden"
          name={entry.name}
          value={entry.value}
        />
      ))}
      <Input
        ref={inputRef}
        name={name}
        defaultValue={defaultValue}
        className={inputClassName}
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
      className={buttonClassName}
      onClick={() => {
        flushSync(() => {
          setEditing(true);
        });
        inputRef.current?.select();
      }}
      style={{ width: "100%", textAlign: "start", ...buttonStyle }}
    >
      {fetcher.formData?.get(name)?.toString() ?? defaultValue}
    </button>
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
  return (
    <Editable
      action={`/boards/${boardId}?method=renameBoardColumn`}
      name="name"
      defaultValue={column.name}
      inputClassName="py-0! px-1! ml-[-0.25rem]"
      buttonClassName="text-sm/6 px-1 ml-[-0.25rem]"
      buttonStyle={style}
      hiddenFormData={[{ name: "columnId", value: column.id }]}
    />
  );
}

function NewItemButton({
  boardId,
  column,
}: {
  boardId: number;
  column: Column;
}) {
  const [editing, setEditing] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fetcher = useFetcher();
  return (
    <div>
      <fetcher.Form
        method="post"
        action={`/boards/${boardId}?method=createColumnItem`}
      >
        <input type="hidden" name="columnId" value={column.id} />
        <div className="grid gap-[12px]" hidden={!editing}>
          <textarea
            ref={textareaRef}
            rows={2}
            name="title"
            className="bg-[var(--white)] px-2.5 py-1 rounded-[6px]"
            placeholder="Enter card name"
          />
          <div className="flex justify-between">
            <TextButton paddingInline={0}>Save</TextButton>
            <TextButton
              paddingInline={0}
              type="button"
              onClick={() => {
                flushSync(() => {
                  setEditing(false);
                });
                buttonRef.current?.focus();
              }}
            >
              Cancel
            </TextButton>
          </div>
        </div>
      </fetcher.Form>

      <TextButton
        ref={buttonRef}
        hidden={editing}
        onClick={() => {
          flushSync(() => {
            setEditing(true);
          });
          textareaRef.current?.focus();
        }}
        paddingInline={0}
        style={{
          textAlign: "start",
          fontSize: "0.8em",
          marginTop: 24,
        }}
      >
        Add Card
      </TextButton>
    </div>
  );
}

function ColumnItem({
  item,
  ...props
}: React.ComponentPropsWithRef<"div"> & { item: Item }) {
  const fetcher = useFetcher();
  const isSubmitting = Boolean(fetcher.state !== "idle");

  return (
    <div
      style={{
        backgroundColor: "var(--white)",
        paddingBlock: 6,
        paddingInline: 12,
        minHeight: "3em",
        borderRadius: 6,
      }}
      {...props}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>{item.title}</span>

        <fetcher.Form
          method="post"
          action={`/boards/${item.boardId}?method=deleteColumnItem`}
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;
            fetcher.submit(form, {
              action: ensure(form.getAttribute("action")),
              method: ensure(form.getAttribute("method")) as HTMLFormMethod,
            });
          }}
        >
          <input type="hidden" name="itemId" value={item.id} />
          <button
            aria-label="Delete Item"
            className="hover:text-blue-500"
            disabled={isSubmitting}
          >
            {isSubmitting ? "deleting..." : <TrashIcon style={{ width: 16 }} />}
          </button>
        </fetcher.Form>
      </div>
    </div>
  );
}

function ColumnComponent({
  column,
  items,
  style,
}: {
  column: Column;
  items: Item[];
  style?: React.CSSProperties;
}) {
  return (
    <ColumnWrapper style={style}>
      <div className="grid gap-[20px]">
        <div className="grid [grid-template-columns:1fr_auto] justify-items-start">
          <ColumnName
            boardId={column.boardId}
            column={column}
            style={{ color: "var(--neutral-400)" }}
          />
          <RemoveColumnButton boardId={column.boardId} columnId={column.id} />
        </div>
        <div className="grid gap-[12px]">
          {items.map((item) => (
            <ColumnItem key={item.id} item={item} />
          ))}
          <NewItemButton boardId={column.boardId} column={column} />
        </div>
      </div>
    </ColumnWrapper>
  );
}

function CreateNewColumn({
  boardId,
  onCreate,
}: {
  boardId: number;
  onCreate: () => void;
}) {
  const fetcher = useFetcher();
  return (
    <ColumnWrapper
      style={{
        minWidth: "10rem",
      }}
    >
      <fetcher.Form
        className="grid gap-[6px]"
        method="post"
        action={`/boards/${boardId}?method=createBoardColumn`}
        onSubmit={(event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const formData = new FormData(form);
          formData.set("id", globalThis.crypto.randomUUID());
          fetcher.submit(formData, {
            action: ensure(form.getAttribute("action")),
            method: ensure(form.getAttribute("method")) as HTMLFormMethod,
            flushSync: true,
          });
          event.currentTarget.reset();
          onCreate();
        }}
      >
        <input type="hidden" name="boardId" value={boardId} />
        <Input
          // temporary hack for focus while we're using the remount
          // technique (key update for <CreateNewColumn/>) to create new fetchers for each submission
          autoFocus={true}
          type="text"
          name="name"
          placeholder="column name"
          required={true}
        />

        <div>
          <TextButton paddingInline={0}>New Column</TextButton>
        </div>
      </fetcher.Form>
    </ColumnWrapper>
  );
}

function PendingColumns({ columns }: { columns: Column[] }) {
  const existingColumnIds = useMemo(
    () => new Set(columns.map((c) => c.id)),
    [columns]
  );
  const fetchers = useFetchers();
  const pendingColumns = fetchers
    .filter((fetcher) => {
      return (
        fetcher.formAction &&
        new URL(fetcher.formAction, location.origin).searchParams.get(
          "method"
        ) === "createBoardColumn"
      );
    })
    .map((fetcher) => {
      const name = ensure(fetcher.formData?.get("name")?.toString());
      const id = ensure(
        fetcher.formData?.get("id")?.toString() || crypto.randomUUID()
      );
      const boardId = ensure(fetcher.formData?.get("boardId")?.toString());
      return { name, id, boardId: Number(boardId), order: 0 };
    })
    .filter((c) => !existingColumnIds.has(c.id));

  return pendingColumns.map((column) => (
    <ColumnComponent
      key={column.id}
      column={column}
      items={[]}
      style={{ opacity: 0.5 }}
    />
  ));
}

export default function Board({ loaderData: { board } }: Route.ComponentProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [key, setKey] = useState(0);
  const scrollBoardToRight = () => {
    invariant(scrollContainerRef.current, "Scroll container not found");
    scrollContainerRef.current.scrollLeft =
      scrollContainerRef.current.scrollWidth;
  };
  return (
    <div className="grid gap-[40px] page-top">
      <ContentColumn className="mx-0!">
        <h2
          className="text-2xl"
          style={{ borderBottom: `2px solid ${board.color}` }}
        >
          <Editable
            action={`/boards/${board.id}?method=renameBoard`}
            defaultValue={board.name}
            name="name"
            hiddenFormData={[{ name: "boardId", value: String(board.id) }]}
            inputClassName="py-0! px-1! ml-[-0.25rem] text-2xl!"
          />
        </h2>
      </ContentColumn>
      <div
        ref={scrollContainerRef}
        className="px-4 py-2"
        style={{
          display: "flex",
          gap: 20,
          alignItems: "start",
          overflowX: "auto",
        }}
      >
        {board.columns.map((column) => (
          <ColumnComponent
            key={column.id}
            column={column}
            items={column.items}
          />
        ))}
        <PendingColumns columns={board.columns} />
        <CreateNewColumn
          key={key}
          boardId={board.id}
          onCreate={useCallback(() => {
            setKey((n) => n + 1);
            scrollBoardToRight();
          }, [])}
        />
      </div>
    </div>
  );
}
