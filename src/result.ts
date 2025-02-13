export type Result<Value, Err> =
  | { status: "ok"; value: Value }
  | { status: "err"; error: Err };

export const Result = {
  ok: <Value, Err>(value: Value): Result<Value, Err> => ({
    status: "ok",
    value,
  }),
  err: <Value, Err>(error: Err): Result<Value, Err> => ({
    status: "err",
    error,
  }),
};

export const isErr = <Value, Err>(result: Result<Value, Err>) => {
  return result.status === "err";
};
