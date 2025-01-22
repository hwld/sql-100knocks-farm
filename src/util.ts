import { join } from "@std/path";
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

export function getProblemPath(no: number): string {
  return join(config.get("100knocksDir"), String(no), "problem.sql");
}

export function getAnswerPath(no: number): string {
  // TODO: 複数の回答があり得る
  return join(config.get("100knocksDir"), String(no), "answers", "1.csv");
}

export function problemExists(no: number): boolean {
  try {
    const path = getProblemPath(no);
    const info = Deno.statSync(path);
    return info.isFile;
  } catch {
    return false;
  }
}

export async function openProblem(no: number): Promise<Result> {
  if (!problemExists(no)) {
    return Result.error();
  }

  await exec(config.get("editorCommand"), [getProblemPath(no)]);
  return Result.ok(undefined);
}
