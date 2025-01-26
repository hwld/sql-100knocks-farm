import { buildCommand } from "../../build-command.ts";
import { getKnockMap } from "../../context/knocks.ts";

type Args = { problemNo: number };

export const solutionCommand = ({ problemNo }: Args) => {
  return buildCommand()
    .description(`Show solution for \`problem ${problemNo}\``)
    .action(() => {
      const knock = getKnockMap().get(problemNo);

      knock?.solutions.forEach((solution) => {
        console.log(`%c\n${solution.sql}`, "color: green");
      });
      console.log();
    });
};
