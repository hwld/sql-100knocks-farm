import { buildCommand } from "../../build-command.ts";
import { config } from "../../config.ts";
import { exec } from "../../exec.ts";
import { getProblemPath } from "../../util.ts";

type Args = { problemNo: number };

export const openProblemCommand = ({ problemNo }: Args) => {
  return buildCommand()
    .description(`Open problem \`${problemNo}\` file`)
    .action(() => {
      exec(config.get("editorCommand"), [getProblemPath(problemNo)]);
    });
};
