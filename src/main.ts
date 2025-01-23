import { logger } from "./logger.ts";
import { config } from "./config.ts";
import { ValidationError } from "@cliffy/command";
import { buildCommand } from "./build-command.ts";
import { startProblemCommand } from "./command/start/start.ts";
import { helpCommand } from "./command/help.ts";
import { exitCommand } from "./command/exit.ts";
import { exec } from "./exec.ts";

async function main() {
  config.load();
  await exec("docker", ["compose", "up", "-d"]);

  while (true) {
    const command = buildCommand();
    command
      .command("help", helpCommand({ command }))
      .command("start", startProblemCommand())
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

main();
