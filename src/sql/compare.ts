import { IndexPairs, pairingIndexes } from "../pairing-indexes.ts";
import { SQLResult } from "./query.ts";

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

  const indexPairsList = pairingIndexes(firstAnswerRow, firstExpectedRow);
  // 0の場合は同じ要素を含んでいないとみなす
  if (indexPairsList.length === 0) {
    return false;
  }

  for (const indexPairs of indexPairsList) {
    if (compareSQLResultByIndexPairs(answer, expected, indexPairs)) {
      return true;
    }
  }

  return true;
}

/**
 *  特定のインデックスペアでSQLの結果を比較する
 *
 *  等しければtrue、等しくなければfalse
 */
function compareSQLResultByIndexPairs(
  answer: SQLResult,
  expected: SQLResult,
  indexPairs: IndexPairs
): boolean {
  for (let rowIndex = 0; rowIndex < answer.rows.length; rowIndex++) {
    for (const [answerColIndex, expectedColIndex] of indexPairs) {
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
