import { logger } from "./logger.ts";

/**
 * コマンドを実行する。
 *
 * コマンドでエラーが発生した場合はプログラムを落とす。
 */
export async function exec(command: string, args?: string[]) {
  const cmd = new Deno.Command(command, { args });
  const result = await cmd.output();

  if (!result.success) {
    const errorMessage = new TextDecoder().decode(result.stderr);

    logger.error(`\`${command} ${args?.join(" ")}\` failed.`);
    logger.error(` ${errorMessage.split(/\r\n|\n|\r/)[0]}`);
    logger.debug(errorMessage);
    Deno.exit(1);
  }
}
