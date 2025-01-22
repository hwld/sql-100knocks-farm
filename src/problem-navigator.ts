import { logger } from "./logger.ts";
import { isErr } from "./result.ts";
import { openProblem } from "./util.ts";

export class ProblemNavigator {
  #currentProblemNo: number;

  constructor(currentProblemNo: number) {
    this.#currentProblemNo = currentProblemNo;
  }

  current = (): number => {
    return this.#currentProblemNo;
  };

  moveNext = async () => {
    const nextNo = this.#currentProblemNo + 1;
    const result = await openProblem(nextNo);
    if (isErr(result)) {
      logger.error("The next problem does not exist");
      return;
    }

    this.#currentProblemNo = nextNo;
  };

  movePrev = async () => {
    const prevNo = this.#currentProblemNo - 1;
    const result = await openProblem(prevNo);
    if (isErr(result)) {
      logger.error("The previous problem does not exist");
      return;
    }

    this.#currentProblemNo = prevNo;
  };
}
