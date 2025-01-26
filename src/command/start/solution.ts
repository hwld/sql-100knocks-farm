import { buildCommand } from "../../build-command.ts";
import { getProblemMap } from "../../context/problem-map.ts";

type Args = { problemNo: number };

export const solutionCommand = ({ problemNo }: Args) => {
  return buildCommand()
    .description(`Show solution for \`problem ${problemNo}\``)
    .action(() => {
      const problem = getProblemMap().get(problemNo);

      problem?.solutions.forEach((solution) => {
        console.log(`%c\n${solution.sql}`, "color: green");
      });
      console.log();
    });
};
