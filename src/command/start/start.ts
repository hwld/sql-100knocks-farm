import { ValidationError } from "@cliffy/command";
import { buildCommand } from "../../build-command.ts";
import { config } from "../../config.ts";
import { exec } from "../../exec.ts";
import { logger } from "../../logger.ts";
import { testProblemCommand } from "./test.ts";
import { helpCommand } from "../help.ts";
import { exitCommand } from "../exit.ts";
import { openProblemCommand } from "./open.ts";
import { getProblemPath } from "../../util.ts";
import { returnCommand } from "./return.ts";

export const startProblemCommand = () => {
  return buildCommand()
    .description("Start a problem")
    .arguments("<problemNo:number>")
    .action(async (_, problemNo) => {
      exec(config.get("editorCommand"), [getProblemPath(problemNo)]);
      const currentProblemNo = problemNo;

      while (true) {
        let shouldReturnToMain = false;
        const returnToMain = () => {
          shouldReturnToMain = true;
        };

        const command = buildCommand();
        command
          .command("help", helpCommand({ command }))
          .command("test", testProblemCommand({ problemNo: currentProblemNo }))
          .command("open", openProblemCommand({ problemNo: currentProblemNo }))
          .command("..", returnCommand({ onReturn: returnToMain }))
          .command("exit", exitCommand());

        try {
          const line = prompt(`skf/${currentProblemNo}>`)?.split(" ");
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
