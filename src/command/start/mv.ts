import { buildCommand } from "../../build-command.ts";
import { ProblemNavigator } from "../../problem/navigator.ts";

type Args = {
  problemNav: ProblemNavigator;
};

export const moveProblemCommand = ({ problemNav }: Args) => {
  return buildCommand()
    .description("Move to problem <problemNo>")
    .arguments("<problemNo:number>")
    .action(async (_, problemNo) => {
      await problemNav.move(problemNo);
    });
};
