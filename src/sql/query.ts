import { QueryObjectResult } from "@bartlomieju/postgres";
import { db } from "./db.ts";

export type SQLResult = {
  columns: string[];
  rows: string[][];
};

export async function query(sql: string): Promise<SQLResult> {
  let result: QueryObjectResult<Record<string, unknown>>;

  const tx = db.createTransaction("transaction");
  try {
    await tx.begin();
    result = await tx.queryObject<Record<string, unknown>>(sql);
  } catch (e) {
    throw e;
  } finally {
    await tx.rollback();
  }

  const columns = result.columns;
  if (!columns) {
    throw new Error("不正なデータ");
  }

  const rows = result.rows.map((row) => {
    const newRow: string[] = [];
    for (const key in row) {
      const index = result.columns?.indexOf(key);
      if (index === undefined || index === -1) {
        throw new Error("不正なデータ");
      }
      newRow[index] = String(row[key]);
    }
    return newRow;
  });

  return { columns, rows };
}
