import { buildCommand } from "../../build-command.ts";

type Args = { onNext: () => Promise<void> };

export const nextProblemCommand = ({ onNext }: Args) => {
  return buildCommand()
    .description("Next problem")
    .action(async () => {
      await onNext();
    });
};
