import { AsyncLocalStorage } from "node:async_hooks";
import { z } from "zod";
import { logger } from "../logger.ts";
import { getAllProblemsPath } from "../problem/path.ts";
import { ProblemSchema } from "../problem/problem.ts";
import { ProblemMap } from "../problem/map.ts";

const problemMapContext = new AsyncLocalStorage<ProblemMap>();

async function loadProblemMap(): Promise<ProblemMap> {
  const json = await Deno.readTextFile(getAllProblemsPath());

  try {
    const problems = z.array(ProblemSchema).parse(JSON.parse(json));
    return new ProblemMap(problems);
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
