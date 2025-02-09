import { ValidationError } from "@cliffy/command";
import { buildCommand } from "../build-command.ts";
import { ProblemNavigator } from "../problem/navigator.ts";
import { loadProblemStatuses } from "../problem/status.ts";
import { shuffle } from "../utils.ts";
import { logger } from "../logger.ts";
import { helpCommand } from "./help.ts";
import { runProblemCommand } from "./run.ts";
import { openProblemCommand } from "./open.ts";
import { solutionCommand } from "./solution.ts";
import { expectedCommand } from "./expected.ts";
import { nextProblemCommand } from "./next.ts";
import { prevProblemCommand } from "./prev.ts";
import { returnCommand } from "./return.ts";
import { exitCommand } from "./exit.ts";
import { openProblem } from "../problem/open.ts";
import { green } from "@std/fmt/colors";

export const randomOrderCommand = () => {
  return buildCommand()
    .description("Start randomized incorrect or unanswered problems")
    .action(async () => {
      const { incorrectNoList, unansweredNoList } = await loadProblemStatuses();

      const problemNoList = shuffle([...incorrectNoList, ...unansweredNoList]);
      if (problemNoList.length === 0) {
        logger.info(green("All problems are correct!"));
        return;
      }

      const initialProblemNo = problemNoList[0];
      const problemNav = new ProblemNavigator(problemNoList, initialProblemNo);

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
          .command("..", returnCommand({ onReturn: returnToMain }))
          .command("exit", exitCommand());

        try {
          const line = prompt(`skf/rand/${problemNav.current()}>`)?.split(" ");
          if (!line) {
            continue;
          }

          await command.parse(line);

          if (shouldReturnToMain) {
            return;
          }
        } catch (e) {
          if (e instanceof ValidationError) {
            command.showHelp();
            logger.error(e.message);
          } else {
            logger.error(e);
            Deno.exit(1);
          }
        }
      }
    });
};
