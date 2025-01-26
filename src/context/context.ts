import { withConfigContext } from "./config.ts";
import { withProblemMapContext } from "./problem-map.ts";

export async function withContext(callback: () => void) {
  await withConfigContext(async () => {
    await withProblemMapContext(callback);
  });
}
