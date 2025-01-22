import { buildCommand } from "../../build-command.ts";
import { openProblem } from "../../util.ts";

type Args = { problemNo: number };

export const openProblemCommand = ({ problemNo }: Args) => {
  return buildCommand()
    .description(`Open the file for problem \`${problemNo}\``)
    .action(async () => {
      await openProblem(problemNo);
    });
};
