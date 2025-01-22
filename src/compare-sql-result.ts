import { SQLResult } from "./main.ts";
import { IndexMapping, mapIndex } from "./map-index.ts";

export function isEqualSQLResult(
  answer: SQLResult,
  expected: SQLResult
): boolean {
  // 行数が異なれば等しくない
  if (answer.rows.length !== expected.rows.length) {
    return false;
  }

  const firstAnswerRow = Object.values(answer.rows[0]);
  const firstExpectedRow = Object.values(expected.rows[0]);

  const indexMaps = mapIndex(firstAnswerRow, firstExpectedRow);
  // mapsが0の場合は同じ要素を含んでいないとみなす
  if (indexMaps.length === 0) {
    return false;
  }

  for (const indexMap of indexMaps) {
    if (compareSQLResultByIndexMap(answer, expected, indexMap)) {
      return true;
    }
  }

  return true;
}

/**
 *  特定のインデックスマップでSQLの結果を比較する
 */
function compareSQLResultByIndexMap(
  answer: SQLResult,
  expected: SQLResult,
  indexMap: IndexMapping
): boolean {
  for (let rowIndex = 0; rowIndex < answer.rows.length; rowIndex++) {
    for (const [answerColIndex, expectedColIndex] of indexMap) {
      if (
        answer.rows[rowIndex][answerColIndex] !==
        expected.rows[rowIndex][expectedColIndex]
      ) {
        return false;
      }
    }
  }

  return true;
}
