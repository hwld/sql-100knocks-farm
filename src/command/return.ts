import { buildCommand } from "../build-command.ts";

type Args = { onReturn: () => void };

export const returnCommand = ({ onReturn }: Args) => {
  return buildCommand()
    .description("Return to the main prompt")
    .action(() => {
      onReturn();
    });
};
