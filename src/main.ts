import { Client } from "@bartlomieju/postgres";
import { loadSQLResultFromCSV } from "./load-sql-result-from-csv.ts";
import { compareSQLResult } from "./compare-sql-result.ts";
import { query } from "./query.ts";
import { logger } from "./logger.ts";
import { exec } from "./exec.ts";
import { config } from "./config.ts";
import { join } from "@std/path";
import { Command, ValidationError } from "@cliffy/command";

type SQLResultRow = string[];
export type SQLResult = {
  columns: string[];
  rows: SQLResultRow[];
};

function getProblemPath(no: number): string {
  return join(config.get("100knocksDir"), String(no), "problem.sql");
}

function getAnswerPath(no: number): string {
  // TODO: 複数の回答があり得る
  return join(config.get("100knocksDir"), String(no), "answers", "1.csv");
}

async function main() {
  config.load();

  const url = Deno.env.get("DATABASE_URL");
  const db = new Client(url);

  while (true) {
    const line = prompt("skf>")?.split(" ");
    if (!line) {
      continue;
    }

    const cmd = new Command()
      .noExit()
      .helpOption(false)
      .command("help", "Display skf help")
      .action(() => {
        cmd.showHelp();
      })
      .command("start <problemNo:number>", "Start a problem")
      .action(async (_, problemNo) => {
        exec(config.get("editorCommand"), [getProblemPath(problemNo)]);

        const no = problemNo;
        while (true) {
          const line = prompt(`skf/${no}>`)?.split(" ");
          if (!line) {
            continue;
          }

          let backParent = false;
          const cmd = new Command()
            .noExit()
            .helpOption(false)
            .command("help")
            .action(() => {
              cmd.showHelp();
            })
            .command("test")
            .action(async () => {
              const sqlText = Deno.readTextFileSync(getProblemPath(no));
              const actualResult = await query(db, sqlText);

              const answerText = Deno.readTextFileSync(getAnswerPath(no));
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
            })
            .command("open")
            .action(() => {
              exec(config.get("editorCommand"), [getProblemPath(no)]);
            })
            .command("..")
            .action(() => {
              backParent = true;
            })
            .command("exit")
            .action(() => {
              Deno.exit(0);
            });

          try {
            await cmd.parse(line);
            if (backParent) {
              return;
            }
          } catch (e) {
            if (e instanceof ValidationError) {
              cmd.showHelp();
              logger.error(e.message);
            } else {
              logger.error(e);
              Deno.exit(1);
            }
          }
        }
      })
      .command("exit", "Exit")
      .action(() => {
        Deno.exit(0);
      });

    try {
      await cmd.parse(line);
    } catch (e) {
      if (e instanceof ValidationError) {
        cmd.showHelp();
        logger.error(e.message);
      } else {
        logger.error(e);
        Deno.exit(1);
      }
    }
  }
}

main();

function parseTableData({
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
