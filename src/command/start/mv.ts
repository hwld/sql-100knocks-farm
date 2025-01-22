import { buildCommand } from "../../build-command.ts";

type Args = { onMove: (problemNo: number) => Promise<void> };

export const moveProblemCommand = ({ onMove }: Args) => {
  return buildCommand()
    .description("Move to problem <problemNo>")
    .arguments("<problemNo:number>")
    .action(async (_, problemNo) => {
      await onMove(problemNo);
    });
};
