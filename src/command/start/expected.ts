import { buildCommand } from "../../build-command.ts";
import { getProblemMap } from "../../context/problem-map.ts";
import { parseCsv } from "../../sql/csv.ts";
import { formatSQLResult } from "../../sql/format.ts";
import { SQLResult } from "../../sql/query.ts";

type Args = { problemNo: number };

export const expectedCommand = ({ problemNo }: Args) => {
  return buildCommand()
    .description("Show expected table's column name and the first row")
    .action(() => {
      const problem = getProblemMap().get(problemNo);

      problem?.solutions.forEach((solution) => {
        const expected = parseCsv(solution.expectedCsv);

        // このコマンドは期待する列を確認することが目的なため、行数を減らすために列と最初の行だけを出力する
        const sample: SQLResult = {
          ...expected,
          rows: expected.rows.slice(0, 1),
        };

        console.log(`%c\n${formatSQLResult(sample)}`, "color: green");
        console.log();
      });
    });
};
