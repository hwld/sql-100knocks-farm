/**
 *  ２つの配列のうち、同じ要素を指すインデックスのペア
 * @example
 * const arr1 = ["a","b","c","d"];
 * const arr2 = ["b","d","a","c"];
 * const pairs: IndexPairs = [[0,2],[1,0],[2,3],[3,0]];
 */
export type IndexPairs = [number, number][];

// 総当たりだから効率は悪そうだけど、値が重複することはあんまりないだろうし・・・

/**
 *  同じ要素を含み順序が異なる可能性のある2つの配列を受け取って、同じ要素を指すインデックスのペアを取得する
 *
 *
 *  要素が重複する可能性があるため、可能性のあるすべてのペアリングを返す。
 *
 *  以下の場合には空の配列を返す。
 *
 *  - 両方の配列が空
 *  - 配列の要素数が異なる
 *  - 同じ要素を含んでいない
 *
 * @example
 * const arr1 = ["a","b","a"];
 * const arr2 = ["b","a","a",];
 * const pairs = pairingIndexes(arr1, arr2);
 * //      ^ [[[0,1],[1,0],[2,2]],[[0,2],[1,0],[2,1]]]
 */
export function pairingIndexes<T>(a: T[], b: T[]): IndexPairs[] {
  if (a.length !== b.length || a.length === 0) {
    return [];
  }

  const bMap = createValueIndexMap(b);

  const mapping: IndexPairs[] = [];

  function generateMappings(aIndex: number, currentMapping: IndexPairs) {
    if (aIndex == a.length) {
      mapping.push(currentMapping);
    }

    const aValue = a[aIndex];
    if (bMap.has(aValue)) {
      const bIndices = bMap.get(aValue)!;
      for (const bIndex of bIndices) {
        const newMapping: IndexPairs = [...currentMapping, [aIndex, bIndex]];

        bMap.set(
          aValue,
          bIndices.filter((i) => i !== bIndex)
        );

        generateMappings(aIndex + 1, newMapping);

        bMap.set(aValue, bIndices);
      }
    }
  }

  generateMappings(0, []);

  if (mapping.at(0)?.length !== a.length) {
    return [];
  }

  return mapping;
}

/**
 *  配列を受け取って、その配列の値をKey、インデックスの配列をValueとするMapを生成する
 *
 * @param arr 配列
 * @returns Map<要素の値, インデックスの配列>
 */
export function createValueIndexMap<T>(arr: T[]): Map<T, number[]> {
  const map = new Map<T, number[]>();

  for (let i = 0; i < arr.length; i++) {
    const value = arr[i];
    if (map.has(value)) {
      map.get(value)?.push(i);
    } else {
      map.set(value, [i]);
    }
  }

  return map;
}
