import { SQLResult } from "./query.ts";
import { Console } from "node:console";
import { Writable } from "node:stream";

/**
 *  SQLResultをテーブル形式の文字列に変換する
 */
export function formatSQLResult({ columns, rows }: SQLResult): string {
  // { col1: row1, col2: row2 } の形式のオブジェクトに変換する
  const obj: Record<string, string>[] = rows.map((row) => {
    const obj: Record<string, string> = {};
    for (let i = 0; i < row.length; i++) {
      obj[columns[i]] = row[i];
    }

    return obj;
  });

  return getTableString(obj);
}

/**
 *  Node.jsのconsole.tableで得られる文字列を返す
 */
function getTableString(data: unknown): string {
  let output = "";
  const writable = new Writable({
    write(chunk, _, callback) {
      output += chunk.toString();
      callback();
    },
  });

  const c = new Console({ stdout: writable });
  c.table(data);

  return output;
}
