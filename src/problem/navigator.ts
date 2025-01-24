import { logger } from "../logger.ts";
import { err, ok, Result } from "../result.ts";
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
    if (result.isErr()) {
      logger.error(`Problem ${problemNo} does not exist`);
    }
  };

  moveNext = async () => {
    const nextNo = this.#currentProblemNo + 1;

    const result = await this.#_move(nextNo);
    if (result.isErr()) {
      logger.error("The next problem does not exist");
    }
  };

  movePrev = async () => {
    const prevNo = this.#currentProblemNo - 1;

    const result = await this.#_move(prevNo);
    if (result.isErr()) {
      logger.error("The previous problem does not exist");
    }
  };

  #_move = async (problemNo: number): Promise<Result<null, null>> => {
    const result = await openProblem(problemNo);
    if (result.isErr()) {
      return err(null);
    }

    this.#currentProblemNo = problemNo;
    return ok(null);
  };
}
