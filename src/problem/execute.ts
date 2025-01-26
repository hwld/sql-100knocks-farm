import { query, SQLResult } from "../sql/query.ts";
import { getProblemPath, getProblemResultPath } from "./path.ts";
import { parse } from "@std/csv";
import { getExpectedPaths, getExpectedResultPath } from "./path.ts";
import { formatSQLResult } from "../sql/format.ts";
import { err, ok, Result } from "../result.ts";

export type ProblemResult = {
  /**
   *  問題の実行結果
   */
  result: SQLResult;

  /**
   *  結果が保存されたファイルへのパス
   */
  resultPath: string;
};

/**
 * 問題の回答を実行してProblemResultを取得する
 */
export async function executeAnswer(
  problemNo: number
): Promise<Result<ProblemResult, string>> {
  const sqlText = await Deno.readTextFile(getProblemPath(problemNo));

  const rawAnswerResult = await query(sqlText);
  if (rawAnswerResult.isErr()) {
    switch (rawAnswerResult.error.type) {
      case "SQL_EMPTY": {
        return err("SQLが存在しません");
      }
      case "UNKNOWN": {
        return err(rawAnswerResult.error.msg);
      }
      default: {
        throw new Error(rawAnswerResult.error satisfies never);
      }
    }
  }

  const answerResult = rawAnswerResult.value;

  const answerResultPath = getProblemResultPath(problemNo);
  await Deno.writeTextFile(answerResultPath, formatSQLResult(answerResult));

  const answerProblemResult: ProblemResult = {
    result: answerResult,
    resultPath: answerResultPath,
  };

  return ok(answerProblemResult);
}

/**
 *  問題の解答データをパースしてProblemResultを取得する
 */
export async function executeExpected(
  problemNo: number
): Promise<ProblemResult[]> {
  const expectedPaths = getExpectedPaths(problemNo);
  if (expectedPaths.length === 0) {
    return [];
  }

  const promisesToParse = expectedPaths.map(async (path) => {
    const csvText = await Deno.readTextFile(path);
    const raw = parse(csvText);
    const sqlResult: SQLResult = { columns: raw[0], rows: raw.slice(1) };

    const resultPath = getExpectedResultPath(path);
    await Deno.writeTextFile(resultPath, formatSQLResult(sqlResult));

    const expectedProblemResult: ProblemResult = {
      result: sqlResult,
      resultPath,
    };

    return expectedProblemResult;
  });

  const expectedProblemResults = await Promise.all(promisesToParse);
  return expectedProblemResults;
}
