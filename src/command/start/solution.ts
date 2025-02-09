import { green } from "@std/fmt/colors";
import { buildCommand } from "../../build-command.ts";
import { getProblemMap } from "../../context/problem-map.ts";
import { logger } from "../../logger.ts";
import { ProblemNavigator } from "../../problem/navigator.ts";

type Args = { problemNav: ProblemNavigator };

export const solutionCommand = ({ problemNav }: Args) => {
  return buildCommand()
    .description("Show solution")
    .action(() => {
      const problemNo = problemNav.current();
      const problem = getProblemMap().get(problemNo);

      problem?.solutions.forEach((solution) => {
        logger.info(green(`\n${solution.sql}`));
      });
      logger.info("");
    });
};
