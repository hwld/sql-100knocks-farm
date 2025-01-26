import { join } from "@std/path";
import { AsyncLocalStorage } from "node:async_hooks";
import z from "zod";
import { logger } from "../logger.ts";

const ConfigSchema = z.object({
  "100knocksDir": z.string(),
  editorCommand: z.string(),
  diffOption: z.string().optional(),
});

type Config = z.infer<typeof ConfigSchema>;

const configContext = new AsyncLocalStorage<Config>();

async function loadConfig(): Promise<Config> {
  const json = await Deno.readTextFile(join(".skf", "settings.json"));

  try {
    return ConfigSchema.parse(JSON.parse(json));
  } catch (e) {
    logger.error("Failed to load config");
    logger.debug(e);
    Deno.exit(1);
  }
}

export function getConfig(): Config {
  const config = configContext.getStore();
  if (!config) {
    logger.error("Config context not found");
    Deno.exit(1);
  }
  return config;
}

export async function withConfigContext(callback: () => void) {
  const config = await loadConfig();
  configContext.run(config, callback);
}
