import { buildCommand } from "../build-command.ts";
import { getProblemMap } from "../context/problem-map.ts";
import { getProblemPath } from "../problem/path.ts";
import { isEqualSQLResult } from "../sql/compare.ts";
import { parseCsv } from "../sql/csv.ts";
import { query } from "../sql/query.ts";
import { convertToRanges } from "../utils.ts";

export const checkCommand = () => {
  return buildCommand()
    .description("Check correct, incorrect, and unanswered problems")
    .action(async () => {
      const allProblems = getProblemMap().getAll();

      const correctNums: number[] = [];
      const incorrectNums: number[] = [];
      const unansweredNums: number[] = [];

      for (const problem of allProblems) {
        const answerSQL = await Deno.readTextFile(getProblemPath(problem.no));
        const result = await query(answerSQL);
        if (result.isErr()) {
          if (result.error.type === "SQL_EMPTY") {
            unansweredNums.push(problem.no);
            continue;
          } else {
            incorrectNums.push(problem.no);
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
          correctNums.push(problem.no);
        } else {
          incorrectNums.push(problem.no);
        }
      }

      console.log("");
      console.log(
        `%ccorrects: ${convertToRanges(correctNums).join(",")}`,
        "color: green"
      );
      console.log(
        `%cincorrects: ${convertToRanges(incorrectNums).join(",")}`,
        "color: red"
      );
      console.log(
        `%cununswereds: ${convertToRanges(unansweredNums).join(",")}`,
        "color: gray"
      );
      console.log("");
    });
};
