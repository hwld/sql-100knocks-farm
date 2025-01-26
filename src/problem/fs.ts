import { formatSQLResult } from "../sql/format.ts";
import { SQLResult } from "../sql/query.ts";
import { getExpectedResultPath, getProblemResultPath } from "./path.ts";

export async function writeAnswerResult({
  problemNo,
  result,
}: {
  problemNo: number;
  result: SQLResult;
}) {
  await Deno.writeTextFile(
    getProblemResultPath(problemNo),
    formatSQLResult(result)
  );
}

export async function writeExpectedResults({
  problemNo,
  solutionNo,
  result,
}: {
  problemNo: number;
  solutionNo: number;
  result: SQLResult;
}) {
  await Deno.writeTextFile(
    getExpectedResultPath({
      problemNo,
      solutionNo: solutionNo,
    }),
    formatSQLResult(result)
  );
}
