import { Client, QueryObjectResult } from "@bartlomieju/postgres";
import { SQLResult } from "./main.ts";

export async function query(client: Client, sql: string): Promise<SQLResult> {
  let actualResult: QueryObjectResult<Record<string, unknown>>;
  const tx = client.createTransaction("transaction");
  try {
    await tx.begin();
    actualResult = await tx.queryObject<Record<string, unknown>>(sql);
  } catch (e) {
    throw e;
  } finally {
    await tx.rollback();
  }

  const columns = actualResult.columns;
  if (!columns) {
    throw new Error("不正なデータ");
  }

  const rows = actualResult.rows.map((row) => {
    const newRow: string[] = [];
    for (const key in row) {
      const index = actualResult.columns?.indexOf(key);
      if (index === undefined || index === -1) {
        throw new Error("不正なデータ");
      }
      newRow[index] = String(row[key]);
    }
    return newRow;
  });

  return { columns, rows };
}
