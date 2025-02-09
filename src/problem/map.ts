import { Problem } from "./problem.ts";

type ProblemNo = number;

export class ProblemMap {
  #map: Map<ProblemNo, Problem>;

  constructor(problems: Problem[]) {
    this.#map = new Map(problems.map((problem) => [problem.no, problem]));
  }

  has(problemNo: ProblemNo): boolean {
    return this.#map.has(problemNo);
  }

  get(problemNo: ProblemNo): Problem | undefined {
    return this.#map.get(problemNo);
  }

  getAll(): Problem[] {
    return [...this.#map.values()];
  }

  /**
   *  問題番号1から順に並んだ問題番号のリストを返す
   */
  getOrderedProblemNoList(): ProblemNo[] {
    return [...this.#map.keys()].toSorted((a, b) => a - b);
  }
}
