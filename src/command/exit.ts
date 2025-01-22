import { buildCommand } from "../build-command.ts";

export const exitCommand = () => {
  return buildCommand()
    .description("Exit")
    .action(() => {
      Deno.exit(0);
    });
};
