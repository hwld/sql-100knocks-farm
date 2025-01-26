import { withConfigContext } from "./config.ts";
import { withKnockMapContext } from "./knocks.ts";

export async function withContext(callback: () => void) {
  await withConfigContext(async () => {
    await withKnockMapContext(callback);
  });
}
