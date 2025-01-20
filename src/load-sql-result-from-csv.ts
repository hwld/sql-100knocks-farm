import { parse } from "@std/csv";

export function loadSQLResultFromCSV(csvText: string) {
  const data = parse(csvText);

  const columns = data[0];
  const rows = data.slice(1);

  return { columns, rows };
}
