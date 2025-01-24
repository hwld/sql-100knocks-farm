import { config } from "../config.ts";
import { exec } from "../exec.ts";
import { fileExists } from "../fs.ts";
import { err, ok, Result } from "../result.ts";
import { getProblemPath } from "./path.ts";

export async function openProblem(no: number): Promise<Result<null, null>> {
  const path = getProblemPath(no);
  if (!fileExists(path)) {
    return err(null);
  }

  await exec(config.get("editorCommand"), [getProblemPath(no)]);
  return ok(null);
}
