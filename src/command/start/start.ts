import { ValidationError } from "@cliffy/command";
import { buildCommand } from "../../build-command.ts";
import { logger } from "../../logger.ts";
import { runProblemCommand } from "./run.ts";
import { helpCommand } from "../help.ts";
import { exitCommand } from "../exit.ts";
import { openProblemCommand } from "./open.ts";
import { returnCommand } from "./return.ts";
import { nextProblemCommand } from "./next.ts";
import { prevProblemCommand } from "./prev.ts";
import { isErr } from "../../result.ts";
import { moveProblemCommand } from "./mv.ts";
import { openProblem } from "../../problem/open.ts";
import { ProblemNavigator } from "../../problem/navigator.ts";

export const startProblemCommand = () => {
  return buildCommand()
    .description("Open problem <problemNo>")
    .arguments("<problemNo:number>")
    .action(async (_, problemNo) => {
      const result = await openProblem(problemNo);
      if (isErr(result)) {
        logger.error(`\`Problem ${problemNo}\` is not found`);
        return;
      }

      const problemNav = new ProblemNavigator(problemNo);

      while (true) {
        let shouldReturnToMain = false;
        const returnToMain = () => {
          shouldReturnToMain = true;
        };

        const command = buildCommand();
        command
          .command("help", helpCommand({ command }))
          .command(
            "run",
            runProblemCommand({ problemNo: problemNav.current() })
          )
          .command("next", nextProblemCommand({ onNext: problemNav.moveNext }))
          .command("prev", prevProblemCommand({ onPrev: problemNav.movePrev }))
          .command("mv", moveProblemCommand({ onMove: problemNav.move }))
          .command(
            "open",
            openProblemCommand({ problemNo: problemNav.current() })
          )
          .command("..", returnCommand({ onReturn: returnToMain }))
          .command("exit", exitCommand());

        try {
          const line = prompt(`skf/${problemNav.current()}>`)?.split(" ");
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
