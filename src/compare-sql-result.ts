import { SQLResult } from "./main.ts";
import { IndexMapping, mapIndex } from "./map-index.ts";

export function compareSQLResult(
  actual: SQLResult,
  expected: SQLResult
): boolean {
  // 行数が異なれば等しくない
  if (actual.rows.length !== expected.rows.length) {
    return false;
  }

  const firstActualRow = Object.values(actual.rows[0]);
  const firstExpectedRow = Object.values(expected.rows[0]);

  const indexMaps = mapIndex(firstActualRow, firstExpectedRow);
  // mapsが0の場合は同じ要素を含んでいないとみなす
  if (indexMaps.length === 0) {
    return false;
  }

  for (const indexMap of indexMaps) {
    if (compareSQLResultByIndexMap(actual, expected, indexMap)) {
      return true;
    }
  }

  return true;
}

/**
 *  特定のインデックスマップでSQLの結果を比較する
 */
function compareSQLResultByIndexMap(
  actual: SQLResult,
  expected: SQLResult,
  indexMap: IndexMapping
): boolean {
  for (let rowIndex = 0; rowIndex < actual.rows.length; rowIndex++) {
    for (const [actualColIndex, expectedColIndex] of indexMap) {
      if (
        actual.rows[rowIndex][actualColIndex] !==
        expected.rows[rowIndex][expectedColIndex]
      ) {
        return false;
      }
    }
  }

  return true;
}
