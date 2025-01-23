import { logger } from "../logger.ts";
import { isErr, Result } from "../result.ts";
import { openProblem } from "./open.ts";

export class ProblemNavigator {
  #currentProblemNo: number;

  constructor(currentProblemNo: number) {
    this.#currentProblemNo = currentProblemNo;
  }

  current = (): number => {
    return this.#currentProblemNo;
  };

  move = async (problemNo: number) => {
    const result = await this.#_move(problemNo);
    if (isErr(result)) {
      logger.error(`Problem ${problemNo} does not exist`);
    }
  };

  moveNext = async () => {
    const nextNo = this.#currentProblemNo + 1;

    const result = await this.#_move(nextNo);
    if (isErr(result)) {
      logger.error("The next problem does not exist");
    }
  };

  movePrev = async () => {
    const prevNo = this.#currentProblemNo - 1;

    const result = await this.#_move(prevNo);
    if (isErr(result)) {
      logger.error("The previous problem does not exist");
    }
  };

  #_move = async (problemNo: number): Promise<Result> => {
    const result = await openProblem(problemNo);
    if (isErr(result)) {
      return Result.error();
    }

    this.#currentProblemNo = problemNo;
    return Result.ok();
  };
}
