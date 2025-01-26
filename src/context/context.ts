import { withConfigContext } from "./config.ts";

export async function withContext(callabck: () => void) {
  await withConfigContext(callabck);
}
