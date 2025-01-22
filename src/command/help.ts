import { Command } from "@cliffy/command";
import { buildCommand } from "../build-command.ts";

type Args = { command: Command };

export const helpCommand = ({ command }: Args) => {
  return buildCommand()
    .description("Show help")
    .action(() => {
      command.showHelp();
    });
};
