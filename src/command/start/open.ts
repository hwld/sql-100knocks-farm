import { buildCommand } from "../../build-command.ts";
import { logger } from "../../logger.ts";
import { isErr } from "../../result.ts";
import { openProblem } from "../../util.ts";

type Args = { problemNo: number };

export const openProblemCommand = ({ problemNo }: Args) => {
  return buildCommand()
    .description(`Open the file for \`problem ${problemNo}\``)
    .action(async () => {
      const result = await openProblem(problemNo);
      if (isErr(result)) {
        logger.error(`\`Problem ${problemNo}\` is not found`);
      }
    });
};
