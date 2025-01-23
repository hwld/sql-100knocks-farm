import { buildCommand } from "../../build-command.ts";
import { config } from "../../config.ts";
import { exec } from "../../exec.ts";
import { logger } from "../../logger.ts";
import {
  executeAnswer,
  parseExpected,
  ProblemResult,
} from "../../problem/reuslt.ts";
import { isEqualSQLResult } from "../../sql/compare.ts";

type Args = { problemNo: number };

export const runProblemCommand = ({ problemNo }: Args) => {
  return buildCommand()
    .description(`Run \`problem ${problemNo}\``)
    .action(async () => {
      const answer = await executeAnswer(problemNo);
      const expectedList = await parseExpected(problemNo);

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
