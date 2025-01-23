import { format, join, parse } from "@std/path";
import { config } from "../config.ts";
import { fileExists } from "../fs.ts";

export function getProblemPath(problemNo: number): string {
  return join(config.get("100knocksDir"), problemNo.toString(), "problem.sql");
}

export function getProblemResultPath(problemNo: number): string {
  return join(config.get("100knocksDir"), problemNo.toString(), "result.txt");
}

/**
 *  問題の解答ファイルのパスを最大3つまで返す
 */
export function getExpectedPaths(problemNo: number): string[] {
  const paths: string[] = [];
  for (let i = 0; i < 3; i++) {
    const path = join(
      config.get("100knocksDir"),
      problemNo.toString(),
      "expected",
      `${i + 1}.csv`
    );

    if (fileExists(path)) {
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
