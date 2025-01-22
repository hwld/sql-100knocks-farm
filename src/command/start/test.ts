import { getAnswerPath, getProblemPath, parseTableData } from "../../util.ts";
import { query } from "../../query.ts";
import { loadSQLResultFromCSV } from "../../load-sql-result-from-csv.ts";
import { compareSQLResult } from "../../compare-sql-result.ts";
import { buildCommand } from "../../build-command.ts";

type Args = { problemNo: number };

export const testProblemCommand = ({ problemNo }: Args) => {
  return buildCommand()
    .description(`Test \`problem ${problemNo}\``)
    .action(async () => {
      const sqlText = Deno.readTextFileSync(getProblemPath(problemNo));
      const actualResult = await query(sqlText);

      const answerText = Deno.readTextFileSync(getAnswerPath(problemNo));
      const answerResult = loadSQLResultFromCSV(answerText);

      const equal = compareSQLResult(actualResult, answerResult);
      if (equal) {
        console.log("%cSuccess", "color: green");
      } else {
        console.log("-- actual --");
        console.table(parseTableData(actualResult));

        console.log("-- answer --");
        console.table(parseTableData(answerResult));

        console.log("%cFailed", "color: red");
      }
    });
};
