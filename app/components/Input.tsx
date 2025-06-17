import type React from "react";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="block
        [background-color:var(--white)]
        w-full
        rounded-md
        px-3
        py-1.5
        text-base
        outline-1
        -outline-offset-1
        outline-gray-300
        placeholder:text-gray-400
        focus:outline-2
        focus:outline-indigo-600
        dark:focus:outline-indigo-500
        sm:text-sm/6"
    />
  );
}
