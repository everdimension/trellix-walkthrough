import classNames from "classnames";
import type React from "react";

export function Input({
  className,
  ...props
}: React.ComponentPropsWithRef<"input">) {
  return (
    <input
      {...props}
      className={classNames(
        `block
            [background-color:var(--white)]
            w-full
            rounded-md
            px-3
            py-1.5
            outline-1
            -outline-offset-1
            outline-gray-300
            placeholder:text-gray-400
            focus:outline-2
            focus:outline-indigo-600
            dark:focus:outline-indigo-500
            text-sm/6`,
        className
      )}
    />
  );
}
