import { format, join, parse } from "@std/path";
import { stat } from "../fs.ts";
import { getConfig } from "../context/config.ts";

export function getProblemPath(problemNo: number): string {
  return join(getConfig()["100knocksDir"], problemNo.toString(), "problem.sql");
}

export function getProblemResultPath(problemNo: number): string {
  return join(getConfig()["100knocksDir"], `${problemNo}`, "result.txt");
}

export function getExpectedDir(problemNo: number) {
  return join(getConfig()["100knocksDir"], `${problemNo}`, "expected");
}

export function getExpectedFileName(expectedNo: number) {
  return `${expectedNo}.csv`;
}

/**
 *  問題の解答ファイルのパスを最大3つまで返す
 */
export function getExpectedPaths(problemNo: number): string[] {
  const paths: string[] = [];
  for (let i = 0; i < 3; i++) {
    const path = join(getExpectedDir(problemNo), getExpectedFileName(i + 1));
    if (stat(path)?.isFile) {
      paths.push(path);
    }
  }

  return paths;
}

export function getExpectedResultPath(expectedPath: string): string {
  const path = parse(expectedPath);
  path.base = path.name + ".txt";
  return format(path);
}

export function getKnocksPath(): string {
  return join(getConfig()["100knocksDir"], "knocks.json");
}
