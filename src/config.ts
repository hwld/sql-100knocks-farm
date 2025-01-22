import { join } from "@std/path";
import { logger } from "./logger.ts";
import z from "zod";

const ConfigSchema = z.object({
  "100knocksDir": z.string(),
  editorCommand: z.string(),
  diffOption: z.string().optional(),
});

type ConfigRecords = z.infer<typeof ConfigSchema>;

class Config {
  #loaded: boolean = false;
  #records: ConfigRecords | undefined;

  load() {
    const json = Deno.readTextFileSync(join(".", ".skf", "settings.json"));

    try {
      this.#records = ConfigSchema.parse(JSON.parse(json));
    } catch (e) {
      logger.error("Failed to load config");
      logger.debug(e);
      Deno.exit(1);
    }

    this.#loaded = true;
  }

  get<T extends keyof ConfigRecords>(key: T): ConfigRecords[T] {
    if (!this.#loaded || !this.#records) {
      logger.error("Config not loaded");
      Deno.exit(1);
    }

    return this.#records[key];
  }
}

export const config = new Config();
