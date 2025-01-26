import { join } from "@std/path";
import { getConfig } from "../context/config.ts";

export function getProblemPath(problemNo: number): string {
  return join(getConfig()["100knocksDir"], problemNo.toString(), "problem.sql");
}

export function getProblemResultPath(problemNo: number): string {
  return join(getConfig()["100knocksDir"], `${problemNo}`, "result.txt");
}

export function getExpectedResultPath({
  problemNo,
  solutionNo,
}: {
  problemNo: number;
  solutionNo: number;
}): string {
  return join(
    getConfig()["100knocksDir"],
    `${problemNo}`,
    `expected${solutionNo}.txt`
  );
}

export function getKnocksPath(): string {
  return join(getConfig()["100knocksDir"], "knocks.json");
}
