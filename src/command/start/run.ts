import { buildCommand } from "../../build-command.ts";
import { getProblemMap } from "../../context/problem-map.ts";
import { logger } from "../../logger.ts";
import { writeAnswerResult, writeExpectedResults } from "../../problem/fs.ts";
import { openProbremResultFiles } from "../../problem/open.ts";
import { getProblemPath } from "../../problem/path.ts";
import { isEqualSQLResult } from "../../sql/compare.ts";
import { parseCsv } from "../../sql/csv.ts";
import { query } from "../../sql/query.ts";

type Args = { problemNo: number };

export const runProblemCommand = ({ problemNo }: Args) => {
  return buildCommand()
    .description(`Run \`problem ${problemNo}\``)
    .action(async () => {
      const problem = getProblemMap().get(problemNo);
      if (!problem) {
        throw new Error("Failed to load problem");
      }

      const answerSQL = await Deno.readTextFile(getProblemPath(problemNo));
      const queryResult = await query(answerSQL);
      if (queryResult.isErr()) {
        logger.error(`${queryResult.error.msg}`);
        return;
      }
      const answerResult = queryResult.value;
      await writeAnswerResult({ problemNo, result: answerResult });

      const isEqualResults = await Promise.all(
        problem.solutions.map(async (solution) => {
          const expectedResult = parseCsv(solution.expectedCsv);
          await writeExpectedResults({
            problemNo,
            solutionNo: solution.no,
            result: expectedResult,
          });

          return isEqualSQLResult(answerResult, expectedResult);
        })
      );

      if (isEqualResults.includes(true)) {
        console.log("%cSuccess", "color: green");
        return;
      }

      console.log("%cFailed", "color: red");
      await openProbremResultFiles(problem);
    });
};
