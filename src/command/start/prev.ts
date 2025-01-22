import { buildCommand } from "../../build-command.ts";

type Args = { onPrev: () => Promise<void> };

export const prevProblemCommand = ({ onPrev }: Args) => {
  return buildCommand()
    .description("Previous problem")
    .action(async () => {
      await onPrev();
    });
};
