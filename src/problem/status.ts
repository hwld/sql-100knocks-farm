import { getProblemMap } from "../context/problem-map.ts";
import { isErr } from "../result.ts";
import { isEqualSQLResult } from "../sql/compare.ts";
import { parseCsv } from "../sql/csv.ts";
import { query } from "../sql/query.ts";
import { getProblemPath } from "./path.ts";

type ProblemStatuses = {
  correctNoList: number[];
  incorrectNoList: number[];
  unansweredNoList: number[];
};

export async function loadProblemStatuses(): Promise<ProblemStatuses> {
  const allProblems = getProblemMap().getAll();

  const correctNoList: number[] = [];
  const incorrectNoList: number[] = [];
  const unansweredNoList: number[] = [];

  for (const problem of allProblems) {
    const answerSQL = await Deno.readTextFile(getProblemPath(problem.no));
    const result = await query(answerSQL);
    if (isErr(result)) {
      if (result.error.type === "SQL_EMPTY") {
        unansweredNoList.push(problem.no);
        continue;
      } else {
        incorrectNoList.push(problem.no);
        continue;
      }
    }
    const answerResult = result.value;

    const isCorrect = problem.solutions
      .map((solution) =>
        isEqualSQLResult(answerResult, parseCsv(solution.expectedCsv))
      )
      .includes(true);

    if (isCorrect) {
      correctNoList.push(problem.no);
    } else {
      incorrectNoList.push(problem.no);
    }
  }

  return { correctNoList, incorrectNoList, unansweredNoList };
}
