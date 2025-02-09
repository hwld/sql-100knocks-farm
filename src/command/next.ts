import { buildCommand } from "../build-command.ts";
import { ProblemNavigator } from "../problem/navigator.ts";

type Args = { problemNav: ProblemNavigator };

export const nextProblemCommand = ({ problemNav }: Args) => {
  return buildCommand()
    .description("Next problem")
    .action(async () => {
      await problemNav.moveNext();
    });
};
