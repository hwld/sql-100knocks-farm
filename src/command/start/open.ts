import { buildCommand } from "../../build-command.ts";
import { getProblemMap } from "../../context/problem-map.ts";
import { logger } from "../../logger.ts";
import { ProblemNavigator } from "../../problem/navigator.ts";
import { openProblem } from "../../problem/open.ts";

type Args = { problemNav: ProblemNavigator };

export const openProblemCommand = ({ problemNav }: Args) => {
  return buildCommand()
    .description("Open problem file")
    .action(async () => {
      const problemNo = problemNav.current();
      if (!getProblemMap().has(problemNo)) {
        logger.error(`Problem '${problemNo}' is not found`);
        return;
      }

      await openProblem(problemNo);
    });
};
