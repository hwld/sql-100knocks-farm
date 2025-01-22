import {
  getExpectedPaths,
  getExpectedResultPath,
  getProblemPath,
  getProblemResultPath,
  parseTableData,
} from "../../util.ts";
import { query } from "../../query.ts";
import { isEqualSQLResult } from "../../compare-sql-result.ts";
import { buildCommand } from "../../build-command.ts";
import { config } from "../../config.ts";
import { exec } from "../../exec.ts";
import { getTableString } from "../../get-table-string.ts";
import { logger } from "../../logger.ts";
import { SQLResult } from "../../main.ts";
import { parse } from "@std/csv";

type Args = { problemNo: number };

export const testProblemCommand = ({ problemNo }: Args) => {
  return buildCommand()
    .description(`Test \`problem ${problemNo}\``)
    .action(async () => {
      const answer = await executeAnswer(problemNo);
      const expectedList = await parseExpected(problemNo);

      if (expectedList.length === 0) {
        logger.error(
          `The expected file for probmel ${problemNo} does not exist`
        );
        return;
      }

      const isEqual = expectedList.some((expected) =>
        isEqualSQLResult(answer.result, expected.result)
      );

      if (isEqual) {
        console.log("%cSuccess", "color: green");
        return;
      }

      console.log("%cFailed", "color: red");
      await openProbremResultFiles({ answer, expectedList });
    });
};

async function openProbremResultFiles({
  answer,
  expectedList,
}: {
  answer: ProblemResult;
  expectedList: ProblemResult[];
}) {
  const diffOption = config.get("diffOption");

  const promisesToOpen = expectedList.map(async (expected) => {
    if (diffOption) {
      await exec(config.get("editorCommand"), [
        diffOption,
        answer.resultPath,
        expected.resultPath,
      ]);
    } else {
      await exec(config.get("editorCommand"), [answer.resultPath]);
    }
  });

  await Promise.all(promisesToOpen);
}

type ProblemResult = {
  /**
   *  問題の実行結果
   */
  result: SQLResult;

  /**
   *  結果が保存されたファイルへのパス
   */
  resultPath: string;
};

async function executeAnswer(problemNo: number): Promise<ProblemResult> {
  const sqlText = await Deno.readTextFile(getProblemPath(problemNo));
  const answerResult = await query(sqlText);

  const answerResultPath = getProblemResultPath(problemNo);
  await Deno.writeTextFile(
    answerResultPath,
    getTableString(parseTableData(answerResult))
  );

  const answerProblemResult: ProblemResult = {
    result: answerResult,
    resultPath: answerResultPath,
  };

  return answerProblemResult;
}

async function parseExpected(problemNo: number): Promise<ProblemResult[]> {
  const expectedPaths = getExpectedPaths(problemNo);
  if (expectedPaths.length === 0) {
    return [];
  }

  const promisesToParse = expectedPaths.map(async (path) => {
    const csvText = await Deno.readTextFile(path);
    const raw = parse(csvText);
    const sqlResult: SQLResult = { columns: raw[0], rows: raw.slice(1) };

    const resultPath = getExpectedResultPath(path);
    await Deno.writeTextFile(
      resultPath,
      getTableString(parseTableData(sqlResult))
    );

    const expectedProblemResult: ProblemResult = {
      result: sqlResult,
      resultPath,
    };

    return expectedProblemResult;
  });

  const expectedProblemResults = await Promise.all(promisesToParse);
  return expectedProblemResults;
}
