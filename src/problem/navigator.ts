import { Err } from "neverthrow";
import { logger } from "../logger.ts";
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

    await this.#_move(index);
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

    await this.#_move(nextIndex);
  };

  movePrev = async () => {
    const prevIndex = this.#currentIndex - 1;

    if (prevIndex < 0) {
      console.log("%cThis is the first problem!", "color: green");
      return;
    }

    await this.#_move(prevIndex);
  };

  #_move = async (problemIndex: number) => {
    const problemNo = this.#problemNoList[problemIndex];
    if (!problemNo) {
      throw new Err("problemNo must exist in the list");
    }

    await openProblem(problemNo);
    this.#currentIndex = problemIndex;
  };
}
