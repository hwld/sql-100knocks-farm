import { logger } from "./logger.ts";
import { ValidationError } from "@cliffy/command";
import { buildCommand } from "./build-command.ts";
import { startProblemCommand } from "./command/start/start.ts";
import { helpCommand } from "./command/help.ts";
import { exitCommand } from "./command/exit.ts";
import { exec } from "./exec.ts";
import { withContext } from "./context/context.ts";
import { checkCommand } from "./command/check.ts";

async function main() {
  await exec("docker", ["compose", "up", "-d"]);

  while (true) {
    const command = buildCommand();
    command
      .command("help", helpCommand({ command }))
      .command("start", startProblemCommand())
      .command("check", checkCommand())
      .command("exit", exitCommand());

    try {
      const line = prompt("skf>")?.split(" ");
      if (!line) {
        continue;
      }

      await command.parse(line);
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
}

await withContext(main);
