import { buildCommand } from "../../build-command.ts";
import { getKnockMap } from "../../context/knocks.ts";
import { logger } from "../../logger.ts";
import { executeAnswer } from "../../problem/execute.ts";
import { writeAnswerResult, writeExpectedResults } from "../../problem/fs.ts";
import { openProbremResultFiles } from "../../problem/open.ts";
import { isEqualSQLResult } from "../../sql/compare.ts";
import { parseCsv } from "../../sql/csv.ts";

type Args = { problemNo: number };

export const runProblemCommand = ({ problemNo }: Args) => {
  return buildCommand()
    .description(`Run \`problem ${problemNo}\``)
    .action(async () => {
      const knock = getKnockMap().get(problemNo);
      if (!knock) {
        throw new Error("Failed to load knock");
      }

      const rawAnswer = await executeAnswer(problemNo);
      if (rawAnswer.isErr()) {
        logger.error(`${rawAnswer.error}`);
        return;
      }
      const answerResult = rawAnswer.value;
      await writeAnswerResult({ problemNo, result: answerResult });

      const isEqualResults = await Promise.all(
        knock.solutions.map(async (solution) => {
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
      await openProbremResultFiles(knock);
    });
};
