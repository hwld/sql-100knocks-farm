import {
  PostgresError,
  QueryObjectResult,
  TransactionError,
} from "@bartlomieju/postgres";
import { db } from "./db.ts";
import { err, ok, Result } from "../result.ts";

export type SQLResult = {
  columns: string[];
  rows: string[][];
};

export async function query(sql: string): Promise<Result<SQLResult, string>> {
  let result: QueryObjectResult<Record<string, unknown>>;

  const tx = db.createTransaction("transaction");
  await tx.begin();
  try {
    result = await tx.queryObject<Record<string, unknown>>(sql);
  } catch (e) {
    if (e instanceof TransactionError && e.cause instanceof PostgresError) {
      return err(e.cause.message);
    }
    throw e;
  }
  await tx.rollback();

  const columns = result.columns;
  if (!columns) {
    return ok({ columns: [], rows: [[]] });
  }

  const rows = result.rows.map((row) => {
    const newRow: string[] = [];
    for (const key in row) {
      const index = columns.indexOf(key);
      newRow[index] = String(row[key]);
    }
    return newRow;
  });

  return ok({ columns, rows });
}
