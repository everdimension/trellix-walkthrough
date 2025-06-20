export function ensure<T>(value: T | null | undefined): T {
  if (value == null) throw new Error("Value missing");
  return value;
}
