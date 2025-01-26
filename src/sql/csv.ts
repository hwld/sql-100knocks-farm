import { parse } from "@std/csv";
import { SQLResult } from "./query.ts";

export function parseCsv(csvText: string): SQLResult {
  const raw = parse(csvText);
  return { columns: raw[0], rows: raw.slice(1) };
}
