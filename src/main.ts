import { Client } from "@bartlomieju/postgres";
import { loadSQLResultFromCSV } from "./load-sql-result-from-csv.ts";
import { compareSQLResult } from "./compare-sql-result.ts";
import { query } from "./query.ts";

type SQLResultRow = string[];
export type SQLResult = {
  columns: string[];
  rows: SQLResultRow[];
};

async function main() {
  const url = Deno.env.get("DATABASE_URL");
  const client = new Client(url);
  await client.connect();

  const sqlText = Deno.readTextFileSync("./100knocks/1/probrem.sql");
  const actualResult = await query(client, sqlText);

  console.log("actual");
  console.log(parseTableData(actualResult));

  const answerText = Deno.readTextFileSync("./100knocks/1/answer.csv");
  const answerResult = loadSQLResultFromCSV(answerText);

  console.log("answer");
  console.log(parseTableData(answerResult));

  console.log(compareSQLResult(actualResult, answerResult));
}

main();

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
