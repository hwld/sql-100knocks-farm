export type IndexMapping = [number, number][];

// 総当たりだから効率は悪そうだけど、値が重複することはあんまりないだろうし・・・

/**
 *  受け取った２つの配列のインデックスをマッピングする。
 *  同じ値が含まれる可能性があるため、可能性のあるすべてのマッピングを返す。
 */
export function mapIndex(a: unknown[], b: unknown[]): IndexMapping[] {
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
