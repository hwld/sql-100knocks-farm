import { query, SQLResult } from "../sql/query.ts";
import { getProblemPath } from "./path.ts";
import { err, ok, Result } from "../result.ts";

export async function executeAnswer(
  problemNo: number
): Promise<Result<SQLResult, string>> {
  const sqlText = await Deno.readTextFile(getProblemPath(problemNo));

  const rawAnswerResult = await query(sqlText);
  if (rawAnswerResult.isErr()) {
    switch (rawAnswerResult.error.type) {
      case "SQL_EMPTY": {
        return err("SQLが存在しません");
      }
      case "UNKNOWN": {
        return err(rawAnswerResult.error.msg);
      }
      default: {
        throw new Error(rawAnswerResult.error satisfies never);
      }
    }
  }

  const answerResult = rawAnswerResult.value;
  return ok(answerResult);
}
