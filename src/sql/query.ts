import {
  PostgresError,
  QueryObjectResult,
  TransactionError,
} from "@bartlomieju/postgres";
import { db } from "./db.ts";
import { err, ok, Result } from "../result.ts";

export type SQLResult = {
  isSQLEmpty?: boolean;
  columns: string[];
  rows: string[][];
};

type QueryError = { type: "SQL_EMPTY" } | { type: "UNKNOWN"; msg: string };

export async function query(
  sql: string
): Promise<Result<SQLResult, QueryError>> {
  let result: QueryObjectResult<Record<string, unknown>>;

  const tx = db.createTransaction("transaction");
  await tx.begin();
  try {
    result = await tx.queryObject<Record<string, unknown>>(sql);
  } catch (e) {
    if (e instanceof TransactionError && e.cause instanceof PostgresError) {
      return err({ type: "UNKNOWN", msg: e.cause.message });
    }
    throw e;
  }
  await tx.rollback();

  if (result.command === undefined) {
    return err({ type: "SQL_EMPTY" });
  }

  const columns = result.columns;
  if (!columns) {
    return ok({ columns: [], rows: [] });
  }

  // 結果をすべて文字列に変換する
  const rows = result.rows.map((row) => {
    const newRow: string[] = [];
    for (const key in row) {
      const colIndex = columns.indexOf(key);

      const col = row[key];
      if (col instanceof Date) {
        // sql100本ノックではDateはyyyy-mm-ddの形式で保存されているのでとりあえずこのフォーマットに変換してみる
        // 他に良い解決策が思いつかない・・・
        const year = col.getFullYear();
        const month = (col.getMonth() + 1).toString().padStart(2, "0");
        const day = col.getDate().toString().padStart(2, "0");
        newRow[colIndex] = `${year}-${month}-${day}`;
      } else {
        newRow[colIndex] = `${col}`;
      }
    }
    return newRow;
  });

  return ok({ columns, rows });
}
