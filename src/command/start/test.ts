import {
  getAnswerPath,
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
import { loadSQLResultFromCSV } from "../../load-sql-result-from-csv.ts";

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

      const answerPath = getAnswerPath(problemNo);
      const answerText = Deno.readTextFileSync(answerPath);
      const answerResult = loadSQLResultFromCSV(answerText);

      const answerResultPath = getAnswerResultPath(problemNo);
      Deno.writeTextFileSync(
        answerResultPath,
        getTableString(parseTableData(answerResult))
      );

      const equal = compareSQLResult(actualResult, answerResult);
      if (equal) {
        console.log("%cSuccess", "color: green");
        return;
      }

      console.log("%cFailed", "color: red");

      const diffOption = config.get("diffOption");
      if (diffOption) {
        await exec(config.get("editorCommand"), [
          diffOption,
          actualResultPath,
          answerResultPath,
        ]);
      } else {
        await exec(config.get("editorCommand"), [actualResultPath]);
      }
    });
};
