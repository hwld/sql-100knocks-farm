import { gray, green, red } from "@std/fmt/colors";
import { buildCommand } from "../build-command.ts";
import { logger } from "../logger.ts";
import { convertToRanges } from "../utils.ts";
import { loadProblemStatuses } from "../problem/status.ts";

export const checkCommand = () => {
  return buildCommand()
    .description("Check correct, incorrect, and unanswered problems")
    .action(async () => {
      const { correctNoList, incorrectNoList, unansweredNoList } =
        await loadProblemStatuses();

      logger.info("");
      logger.info(
        green(`corrects: ${convertToRanges(correctNoList).join(",")}`)
      );
      logger.info(
        red(`incorrects: ${convertToRanges(incorrectNoList).join(",")}`)
      );
      logger.info(
        gray(`ununswereds: ${convertToRanges(unansweredNoList).join(",")}`)
      );
      logger.info("");
    });
};
