export function convertToRanges(_nums: number[]): string[] {
  if (_nums.length === 0) {
    return [];
  }

  const nums = _nums.toSorted((a, b) => a - b);

  const ranges: string[] = [];
  let start = nums[0];
  let end = nums[0];

  const addRange = () => {
    ranges.push(start === end ? `${start}` : `${start} ~ ${end}`);
  };

  for (let i = 1; i < nums.length; i++) {
    const currentNum = nums[i];
    if (currentNum === end + 1) {
      end = currentNum;
    } else {
      addRange();
      start = currentNum;
      end = currentNum;
    }
  }
  addRange();

  return ranges;
}
