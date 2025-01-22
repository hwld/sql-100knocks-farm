import {
  getAnswerPaths,
  getAnswerResultPath,
  getProblemPath,
  getProblemResultPath,
  parseTableData,
} from "../../util.ts";
import { query } from "../../query.ts";
import { compareSQLResult } from "../../compare-sql-result.ts";
import { buildCommand } from "../../build-command.ts";
import { config } from "../../config.ts";
import { exec } from "../../exec.ts";
import { getTableString } from "../../get-table-string.ts";
import { loadSQLResultsFromCSV } from "../../load-sql-result-from-csv.ts";
import { logger } from "../../logger.ts";

type Args = { problemNo: number };

export const testProblemCommand = ({ problemNo }: Args) => {
  return buildCommand()
    .description(`Test \`problem ${problemNo}\``)
    .action(async () => {
      const sqlText = Deno.readTextFileSync(getProblemPath(problemNo));
      const actualResult = await query(sqlText);

      const actualResultPath = getProblemResultPath(problemNo);
      Deno.writeTextFileSync(
        actualResultPath,
        getTableString(parseTableData(actualResult))
      );

      const answerPaths = getAnswerPaths(problemNo);
      if (answerPaths.length === 0) {
        logger.error(`The answer for probmel ${problemNo} does not exist`);
        return;
      }

      const answerResults = await loadSQLResultsFromCSV(answerPaths);
      const answerResultPaths = await Promise.all(
        answerResults.map(async ({ answerPath, result }) => {
          const resultPath = getAnswerResultPath(answerPath);
          await Deno.writeTextFile(
            resultPath,
            getTableString(parseTableData(result))
          );

          return { answerResultPath: resultPath, result };
        })
      );

      const compareResults = answerResultPaths.map((args) => {
        return { ...args, equal: compareSQLResult(actualResult, args.result) };
      });

      if (compareResults.some((e) => e.equal)) {
        console.log("%cSuccess", "color: green");
        return;
      }

      console.log("%cFailed", "color: red");

      for (let i = 0; i < compareResults.length; i++) {
        const result = compareResults[i];

        const diffOption = config.get("diffOption");
        if (diffOption) {
          await exec(config.get("editorCommand"), [
            diffOption,
            actualResultPath,
            result.answerResultPath,
          ]);
        } else {
          await exec(config.get("editorCommand"), [actualResultPath]);
        }
      }
    });
};
