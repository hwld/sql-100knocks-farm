import { IndexPairs, pairingIndexes } from "./pairing-indexes.ts";
import { testEach } from "./test-util.ts";
import { assertEquals } from "@std/assert";

type TestCase = { a: unknown[]; b: unknown[]; expected: IndexPairs[] };

const testCases: { [a: string]: TestCase } = {
  重複なし: {
    a: ["a", "b", "c"],
    b: ["b", "c", "a"],
    expected: [
      [
        [0, 2],
        [1, 0],
        [2, 1],
      ],
    ],
  },
  重複あり1: {
    a: ["a", "b", "a"],
    b: ["b", "a", "a"],
    expected: [
      [
        [0, 1],
        [1, 0],
        [2, 2],
      ],
      [
        [0, 2],
        [1, 0],
        [2, 1],
      ],
    ],
  },
  重複あり2: {
    a: ["a", "b", "a", "b"],
    b: ["b", "a", "b", "a"],
    expected: [
      [
        [0, 1],
        [1, 0],
        [2, 3],
        [3, 2],
      ],
      [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
      ],
      [
        [0, 3],
        [1, 0],
        [2, 1],
        [3, 2],
      ],
      [
        [0, 3],
        [1, 2],
        [2, 1],
        [3, 0],
      ],
    ],
  },
  重複あり3: {
    a: [1, 2, 1],
    b: [2, 1, 1],
    expected: [
      [
        [0, 1],
        [1, 0],
        [2, 2],
      ],
      [
        [0, 2],
        [1, 0],
        [2, 1],
      ],
    ],
  },
  型が異なる場合: {
    a: [1, "b", true],
    b: [true, 1, "b"],
    expected: [
      [
        [0, 1],
        [1, 2],
        [2, 0],
      ],
    ],
  },
  すべて同じ値: {
    a: ["a", "a", "a"],
    b: ["a", "a", "a"],
    expected: [
      [
        [0, 0],
        [1, 1],
        [2, 2],
      ],
      [
        [0, 0],
        [1, 2],
        [2, 1],
      ],
      [
        [0, 1],
        [1, 0],
        [2, 2],
      ],
      [
        [0, 1],
        [1, 2],
        [2, 0],
      ],
      [
        [0, 2],
        [1, 0],
        [2, 1],
      ],
      [
        [0, 2],
        [1, 1],
        [2, 0],
      ],
    ],
  },
  空配列: {
    a: [],
    b: [],
    expected: [],
  },
  要素が異なる配列: {
    a: ["a", "b", "c"],
    b: ["d", "e", "f"],
    expected: [],
  },
  要素数が異なる配列: {
    a: ["a", "b", "c"],
    b: ["a", "b"],
    expected: [],
  },
};

testEach<TestCase>(testCases, ({ a, b, expected }) => {
  const actual = pairingIndexes(a, b);
  assertEquals(actual, expected);
});
