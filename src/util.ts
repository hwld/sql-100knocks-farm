import { format, join, parse } from "@std/path";
import { SQLResult } from "./main.ts";
import { config } from "./config.ts";
import { exec } from "./exec.ts";
import { Result } from "./result.ts";

export function testEach<T>(params: Record<string, T>, cb: (p: T) => void) {
  Object.keys(params).map((title) => {
    Deno.test(title, () => {
      cb(params[title]);
    });
  });
}

export function parseTableData({
  columns,
  rows,
}: SQLResult): Record<string, string>[] {
  return rows.map((row) => {
    const obj: Record<string, string> = {};
    for (let i = 0; i < row.length; i++) {
      obj[columns[i]] = row[i];
    }

    return obj;
  });
}

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

export function fileExists(path: string): boolean {
  try {
    const info = Deno.statSync(path);
    return info.isFile;
  } catch {
    return false;
  }
}

export async function openProblem(no: number): Promise<Result> {
  const path = getProblemPath(no);
  if (!fileExists(path)) {
    return Result.error();
  }

  await exec(config.get("editorCommand"), [getProblemPath(no)]);
  return Result.ok();
}
