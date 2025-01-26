import { getConfig } from "../context/config.ts";
import { exec } from "../exec.ts";
import { stat } from "../fs.ts";
import { err, ok, Result } from "../result.ts";
import { ProblemResult } from "./execute.ts";
import { getProblemPath } from "./path.ts";

export async function openProblem(no: number): Promise<Result<null, null>> {
  const path = getProblemPath(no);
  if (!stat(path)?.isFile) {
    return err(null);
  }

  await exec(getConfig().editorCommand, [getProblemPath(no)]);
  return ok(null);
}

export async function openProbremResultFiles({
  answer,
  expectedList,
}: {
  answer: ProblemResult;
  expectedList: ProblemResult[];
}) {
  const editorCommand = getConfig().editorCommand;
  const diffOption = getConfig().diffOption;

  const promisesToOpen = expectedList.map(async (expected) => {
    if (diffOption) {
      await exec(editorCommand, [
        diffOption,
        answer.resultPath,
        expected.resultPath,
      ]);
    } else {
      await exec(editorCommand, [answer.resultPath]);
    }
  });

  await Promise.all(promisesToOpen);
}
