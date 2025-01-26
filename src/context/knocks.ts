import { join } from "@std/path";
import { AsyncLocalStorage } from "node:async_hooks";
import { z } from "zod";
import { getConfig } from "./config.ts";
import { logger } from "../logger.ts";

const KnockSchema = z.object({
  problemNo: z.number(),
  problem: z.string(),
  solutions: z.array(
    z.object({
      sql: z.string(),
      expectedCsv: z.string(),
    })
  ),
});
type Knock = z.infer<typeof KnockSchema>;

const knockMapContext = new AsyncLocalStorage<Map<number, Knock>>();

async function loadKnockMap(): Promise<Map<number, Knock>> {
  const json = await Deno.readTextFile(
    join(getConfig()["100knocksDir"], "knocks.json")
  );

  try {
    const knocks = z.array(KnockSchema).parse(JSON.parse(json));
    return new Map(knocks.map((knock) => [knock.problemNo, knock]));
  } catch (e) {
    logger.error("Failed to load knocks");
    logger.debug(e);
    Deno.exit(1);
  }
}

export function getKnockMap() {
  const knocks = knockMapContext.getStore();
  if (!knocks) {
    logger.error("Knocks context not found");
    Deno.exit(1);
  }

  return knocks;
}

export async function withKnockMapContext(callback: () => void) {
  const knocks = await loadKnockMap();
  knockMapContext.run(knocks, callback);
}
