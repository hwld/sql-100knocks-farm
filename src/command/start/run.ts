import { buildCommand } from "../../build-command.ts";
import { config } from "../../config.ts";
import { exec } from "../../exec.ts";
import { logger } from "../../logger.ts";
import {
  executeAnswer,
  executeExpected,
  ProblemResult,
} from "../../problem/execute.ts";
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

async function openProbremResultFiles({
  answer,
  expectedList,
}: {
  answer: ProblemResult;
  expectedList: ProblemResult[];
}) {
  const diffOption = config.get("diffOption");

  const promisesToOpen = expectedList.map(async (expected) => {
    if (diffOption) {
      await exec(config.get("editorCommand"), [
        diffOption,
        answer.resultPath,
        expected.resultPath,
      ]);
    } else {
      await exec(config.get("editorCommand"), [answer.resultPath]);
    }
  });

  await Promise.all(promisesToOpen);
}
