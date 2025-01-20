export type IndexMapping = [number, number][];

// 総当たりだから効率は悪そうだけど、値が重複することはあんまりないだろうし・・・

/**
 *  同じ要素を含み、順序が異なる可能性のある配列を受け取って、インデックスをマッピングする。
 *  同じ値が含まれる可能性があるため、可能性のあるすべてのマッピングを返す。
 *
 *  以下の場合には空の配列を返す。
 *
 *  - 両方の配列が空
 *  - 配列の要素数が異なる
 *  - 同じ要素を含んでいない
 */
export function mapIndex<T>(a: T[], b: T[]): IndexMapping[] {
  if (a.length !== b.length || a.length === 0) {
    return [];
  }

  const bMap = createValueIndexMap(b);

  const mapping: IndexMapping[] = [];

  function generateMappings(aIndex: number, currentMapping: IndexMapping) {
    if (aIndex == a.length) {
      mapping.push(currentMapping);
    }

    const aValue = a[aIndex];
    if (bMap.has(aValue)) {
      const bIndices = bMap.get(aValue)!;
      for (const bIndex of bIndices) {
        const newMapping: IndexMapping = [...currentMapping, [aIndex, bIndex]];

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
