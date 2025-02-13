import { green } from "@std/fmt/colors";
import { buildCommand } from "../build-command.ts";
import { getProblemMap } from "../context/problem-map.ts";
import { logger } from "../logger.ts";
import { ProblemNavigator } from "../problem/navigator.ts";
import { parseCsv } from "../sql/csv.ts";
import { formatSQLResult } from "../sql/format.ts";
import { SQLResult } from "../sql/query.ts";

type Args = { problemNav: ProblemNavigator };

export const expectedCommand = ({ problemNav }: Args) => {
  return buildCommand()
    .description("Show expected table's column name and the first row")
    .action(() => {
      const problemNo = problemNav.current();
      const problem = getProblemMap().get(problemNo);

      problem?.solutions.forEach((solution) => {
        const expected = parseCsv(solution.expectedCsv);

        // このコマンドは期待する列を確認することが目的なため、行数を減らすために列と最初の行だけを出力する
        const sample: SQLResult = {
          ...expected,
          rows: expected.rows.slice(0, 1),
        };

        logger.info(green(`\n${formatSQLResult(sample)}\n`));
      });
    });
};
