import { buildCommand } from "../../build-command.ts";
import { logger } from "../../logger.ts";
import { executeAnswer, executeExpected } from "../../problem/execute.ts";
import { openProbremResultFiles } from "../../problem/open.ts";
import { isEqualSQLResult } from "../../sql/compare.ts";

type Args = { problemNo: number };

export const runProblemCommand = ({ problemNo }: Args) => {
  return buildCommand()
    .description(`Run \`problem ${problemNo}\``)
    .action(async () => {
      const rawAnswer = await executeAnswer(problemNo);
      if (rawAnswer.isErr()) {
        logger.error(`${rawAnswer.error}`);
        return;
      }

      const answer = rawAnswer.value;
      const expectedList = await executeExpected(problemNo);

      if (expectedList.length === 0) {
        logger.error(
          `The expected file for probmel ${problemNo} does not exist`
        );
        return;
      }

      const isEqual = expectedList.some((expected) =>
        isEqualSQLResult(answer.result, expected.result)
      );

      if (isEqual) {
        console.log("%cSuccess", "color: green");
        return;
      }

      console.log("%cFailed", "color: red");
      await openProbremResultFiles({ answer, expectedList });
    });
};
