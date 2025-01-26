import { AsyncLocalStorage } from "node:async_hooks";
import { z } from "zod";
import { logger } from "../logger.ts";
import { getAllProblemsPath } from "../problem/path.ts";
import { Problem, ProblemSchema } from "../problem/problem.ts";

const problemMapContext = new AsyncLocalStorage<Map<number, Problem>>();

async function loadProblemMap(): Promise<Map<number, Problem>> {
  const json = await Deno.readTextFile(getAllProblemsPath());

  try {
    const problems = z.array(ProblemSchema).parse(JSON.parse(json));
    return new Map(problems.map((problem) => [problem.no, problem]));
  } catch (e) {
    logger.error("Failed to load Problems");
    logger.debug(e);
    Deno.exit(1);
  }
}

export function getProblemMap() {
  const problems = problemMapContext.getStore();
  if (!problems) {
    logger.error("ProblemMap context not found");
    Deno.exit(1);
  }

  return problems;
}

export async function withProblemMapContext(callback: () => void) {
  const problemMap = await loadProblemMap();
  problemMapContext.run(problemMap, callback);
}
