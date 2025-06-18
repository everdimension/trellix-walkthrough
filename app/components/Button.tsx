import classNames from "classnames";

export function TextButton({
  className,
  paddingInline = 25,
  style,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  paddingInline?: number;
}) {
  return (
    <button
      {...props}
      style={{ ["--padding-inline" as string]: `${paddingInline}px`, ...style }}
      className={classNames(
        `bg-transparent
          [padding-inline:var(--padding-inline)]
          text-sm/6
          [line-height:1.5]
          text-blue-500
          hover:text-blue-600
          rounded-[4px]
          focus-visible:outline-2
          focus-visible:outline-offset-2
          focus-visible:outline-blue-600`,
        className
      )}
    />
  );
}

export function Button({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={classNames(
        `rounded-md
          bg-indigo-600
          px-5
          py-1
          text-sm/6
          font-semibold
          text-white
          shadow-xs
          hover:bg-indigo-500
          focus-visible:outline-2
          focus-visible:outline-offset-2
          focus-visible:outline-indigo-600`,
        className
      )}
    />
  );
}
