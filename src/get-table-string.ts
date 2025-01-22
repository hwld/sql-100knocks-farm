import { Console } from "node:console";
import { Transform } from "node:stream";

const ts = new Transform({
  transform(chunk, _, cb) {
    cb(null, chunk);
  },
});

const c = new Console({ stdout: ts });

export function getTableString(data: unknown): string {
  c.table(data);
  return (ts.read() || "").toString();
}
