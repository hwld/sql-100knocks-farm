import { logger } from "../logger.ts";
import { err, ok, Result } from "../result.ts";
import { openProblem } from "./open.ts";

export class ProblemNavigator {
  #problemNoList: number[];
  #currentIndex: number;

  /**
   * @param problemNoList
   * @param currentProblemNo 現在のProblemNoを、problemNoListの中から選ぶ
   */
  constructor(problemNoList: number[], currentProblemNo: number) {
    const currentIndex = problemNoList.indexOf(currentProblemNo);
    if (currentIndex === -1) {
      throw new Error("currentProblemNo must exist in the list");
    }

    this.#problemNoList = problemNoList;
    this.#currentIndex = currentIndex;
  }

  current = (): number => {
    return this.#problemNoList[this.#currentIndex];
  };

  move = async (problemNo: number) => {
    const index = this.#problemNoList.indexOf(problemNo);
    if (index === -1) {
      logger.error(`Problem ${problemNo} does not exist`);
      return;
    }

    const result = await this.#_move(index);
    if (result.isErr()) {
      logger.error(`Problem ${problemNo} does not exist`);
    }
  };

  moveNext = async () => {
    const nextIndex = this.#currentIndex + 1;

    if (nextIndex >= this.#problemNoList.length) {
      console.log(
        "%cNo more problems. You've reached the end!",
        "color: green"
      );
      return;
    }

    const result = await this.#_move(nextIndex);
    if (result.isErr()) {
      logger.error("The next problem does not exist");
    }
  };

  movePrev = async () => {
    const prevIndex = this.#currentIndex - 1;

    if (prevIndex < 0) {
      console.log("%cThis is the first problem!", "color: green");
      return;
    }

    const result = await this.#_move(prevIndex);
    if (result.isErr()) {
      logger.error("The previous problem does not exist");
    }
  };

  // TODO: 問題の有無は事前にチェックしたいので、Resultにしないでエラーは例外で出したい
  #_move = async (problemIndex: number): Promise<Result<null, null>> => {
    const problemNo = this.#problemNoList[problemIndex];

    const result = await openProblem(problemNo);
    if (result.isErr()) {
      return err(null);
    }

    this.#currentIndex = problemIndex;
    return ok(null);
  };
}
