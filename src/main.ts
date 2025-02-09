import { buildCommand } from "./build-command.ts";
import { startProblemCommand } from "./command/start.ts";
import { helpCommand } from "./command/help.ts";
import { exitCommand } from "./command/exit.ts";
import { exec } from "./exec.ts";
import { withContext } from "./context/context.ts";
import { checkCommand } from "./command/check.ts";
import { randomOrderCommand } from "./command/random-order.ts";
import { executeCommand } from "./command/execute-command.ts";

async function main() {
  await exec("docker", ["compose", "up", "-d"]);

  while (true) {
    const command = buildCommand();
    command
      .command("help", helpCommand({ command }))
      .command("start", startProblemCommand())
      .command("rand", randomOrderCommand())
      .command("check", checkCommand())
      .command("exit", exitCommand());

    await executeCommand({ command, promptMessage: "skf>" });
  }
}

await withContext(main);
