import { buildCommand } from "../../build-command.ts";
import { ProblemNavigator } from "../../problem/navigator.ts";

type Args = { problemNav: ProblemNavigator };

export const prevProblemCommand = ({ problemNav }: Args) => {
  return buildCommand()
    .description("Previous problem")
    .action(async () => {
      await problemNav.movePrev();
    });
};
