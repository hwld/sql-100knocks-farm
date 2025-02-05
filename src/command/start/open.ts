import { buildCommand } from "../../build-command.ts";
import { logger } from "../../logger.ts";
import { openProblem } from "../../problem/open.ts";

type Args = { problemNo: number };

export const openProblemCommand = ({ problemNo }: Args) => {
  return buildCommand()
    .description("Open problem file")
    .action(async () => {
      const result = await openProblem(problemNo);
      if (result.isErr()) {
        logger.error(`\`Problem ${problemNo}\` is not found`);
      }
    });
};
