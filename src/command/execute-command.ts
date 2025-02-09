import { Command, ValidationError } from "@cliffy/command";
import { logger } from "../logger.ts";

type Args = { command: Command; promptMessage: string };

export async function executeCommand({ command, promptMessage }: Args) {
  try {
    const line = prompt(promptMessage)?.split(" ");
    if (!line) {
      return;
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
