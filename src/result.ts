export type Result<T = undefined> =
  | { status: "ok"; value: T }
  | { status: "error" };

export function isErr<T>(result: Result<T>) {
  return result.status === "error";
}

export function isOk<T>(result: Result<T>) {
  return result.status === "ok";
}

export const Result = {
  ok: <T>(value: T): Result<T> => ({ status: "ok", value }),
  error: <T>(): Result<T> => ({ status: "error" }),
};
