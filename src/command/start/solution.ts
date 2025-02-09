import { buildCommand } from "../../build-command.ts";
import { getProblemMap } from "../../context/problem-map.ts";
import { ProblemNavigator } from "../../problem/navigator.ts";

type Args = { problemNav: ProblemNavigator };

export const solutionCommand = ({ problemNav }: Args) => {
  return buildCommand()
    .description("Show solution")
    .action(() => {
      const problemNo = problemNav.current();
      const problem = getProblemMap().get(problemNo);

      problem?.solutions.forEach((solution) => {
        console.log(`%c\n${solution.sql}`, "color: green");
      });
      console.log();
    });
};
