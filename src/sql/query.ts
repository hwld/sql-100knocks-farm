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

type QueryError =
  | { type: "SQL_EMPTY"; msg: string }
  | { type: "UNKNOWN"; msg: string };

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

    // 列名が重複すると例外が出ちゃうのでハンドリングする
    // カスタムエラー型が使われてないので、エラーメッセージを見るしかない？
    if (
      e instanceof Error &&
      // https://github.com/denodrivers/postgres/blob/256fb860ea8d959872421950e6158910e9fe6c0f/query/query.ts#L341
      e.message.match(/^Field names.*are duplicated in the result of the query/)
    ) {
      return err({ type: "UNKNOWN", msg: e.message });
    }
    throw e;
  }
  await tx.rollback();

  if (result.command === undefined) {
    return err({ type: "SQL_EMPTY", msg: "SQL is empty" });
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
