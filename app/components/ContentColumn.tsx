import classNames from "classnames";
import type { HTMLAttributes } from "react";

export function ContentColumn({
  className, ...props
}: React.PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={classNames("max-w-2xl mx-auto px-4", className)} {...props} />
  );
}
