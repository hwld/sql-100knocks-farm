import { getConfig } from "../context/config.ts";
import { exec } from "../exec.ts";
import { getProblemResultPath } from "./path.ts";
import { getExpectedResultPath } from "./path.ts";
import { getProblemPath } from "./path.ts";
import { Problem } from "./problem.ts";

export async function openProblem(no: number) {
  await exec(getConfig().editorCommand, [getProblemPath(no)]);
}

export async function openProbremResultFiles(problem: Problem) {
  const editorCommand = getConfig().editorCommand;
  const diffOption = getConfig().diffOption;

  const promisesToOpen = problem.solutions.map(async (solution) => {
    if (diffOption) {
      await exec(editorCommand, [
        diffOption,
        getProblemResultPath(problem.no),
        getExpectedResultPath({
          problemNo: problem.no,
          solutionNo: solution.no,
        }),
      ]);
    } else {
      await exec(editorCommand, [
        getExpectedResultPath({
          problemNo: problem.no,
          solutionNo: solution.no,
        }),
      ]);
    }
  });

  await Promise.all(promisesToOpen);
}
