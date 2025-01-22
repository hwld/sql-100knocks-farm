import { parse } from "@std/csv";
import { SQLResult } from "./main.ts";

export function loadSQLResultsFromCSV(
  answerPaths: string[]
): Promise<{ answerPath: string; result: SQLResult }[]> {
  return Promise.all(
    answerPaths.map(async (path) => {
      const csvText = await Deno.readTextFile(path);
      const raw = parse(csvText);

      return {
        answerPath: path,
        result: { columns: raw[0], rows: raw.slice(1) },
      };
    })
  );
}
