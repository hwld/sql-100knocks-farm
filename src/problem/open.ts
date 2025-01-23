import { config } from "../config.ts";
import { exec } from "../exec.ts";
import { fileExists } from "../fs.ts";
import { Result } from "../result.ts";
import { getProblemPath } from "./path.ts";

export async function openProblem(no: number): Promise<Result> {
  const path = getProblemPath(no);
  if (!fileExists(path)) {
    return Result.error();
  }

  await exec(config.get("editorCommand"), [getProblemPath(no)]);
  return Result.ok();
}
