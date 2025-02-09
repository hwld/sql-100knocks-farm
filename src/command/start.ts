import { buildCommand } from "../build-command.ts";
import { logger } from "../logger.ts";
import { runProblemCommand } from "./run.ts";
import { helpCommand } from "./help.ts";
import { exitCommand } from "./exit.ts";
import { openProblemCommand } from "./open.ts";
import { returnCommand } from "./return.ts";
import { nextProblemCommand } from "./next.ts";
import { prevProblemCommand } from "./prev.ts";
import { moveProblemCommand } from "./mv.ts";
import { openProblem } from "../problem/open.ts";
import { ProblemNavigator } from "../problem/navigator.ts";
import { solutionCommand } from "./solution.ts";
import { expectedCommand } from "./expected.ts";
import { getProblemMap } from "../context/problem-map.ts";
import { executeCommand } from "./execute-command.ts";

export const startProblemCommand = () => {
  return buildCommand()
    .description("Start problem <problemNo>")
    .arguments("<problemNo:number>")
    .action(async (_, initialProblemNo) => {
      if (!getProblemMap().has(initialProblemNo)) {
        logger.error(`Problem '${initialProblemNo}' is not found`);
        return;
      }

      const allProblemNoList = getProblemMap().getOrderedProblemNoList();
      const problemNav = new ProblemNavigator(
        allProblemNoList,
        initialProblemNo
      );

      await openProblem(initialProblemNo);

      while (true) {
        let shouldReturnToMain = false;
        const returnToMain = () => {
          shouldReturnToMain = true;
        };

        const command = buildCommand();
        command
          .command("help", helpCommand({ command }))
          .command("run", runProblemCommand({ problemNav }))
          .command("open", openProblemCommand({ problemNav }))
          .command("solution", solutionCommand({ problemNav }))
          .command("expected", expectedCommand({ problemNav }))
          .command("next", nextProblemCommand({ problemNav }))
          .command("prev", prevProblemCommand({ problemNav }))
          .command("mv", moveProblemCommand({ problemNav }))
          .command("..", returnCommand({ onReturn: returnToMain }))
          .command("exit", exitCommand());

        await executeCommand({
          command,
          promptMessage: `skf/start/${problemNav.current()}>`,
        });

        if (shouldReturnToMain) {
          return;
        }
      }
    });
};
