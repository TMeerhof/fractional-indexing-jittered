import { IndexedCharacterSet } from "./charSet";

export function distanceBetween(
  a: string,
  b: string,
  charSet: IndexedCharacterSet
) {
  const indexA = charSet.byChar[a];
  const indexB = charSet.byChar[b];
  return Math.abs(indexA - indexB);
}

export function integerLength(
  head: string,
  charSet: IndexedCharacterSet
): number {
  const firstChar = head[0];
  if (firstChar > charSet.mostPositive || firstChar < charSet.mostNegative) {
    throw new Error("invalid firstChar on key");
  }
  if (firstChar === charSet.mostPositive) {
    const firstLevel =
      distanceBetween(firstChar, charSet.firstPositive, charSet) + 1;
    return (
      firstLevel +
      integerLengthFromSecondLevel(head.slice(1), "positive", charSet)
    );
  }
  if (firstChar === charSet.mostNegative) {
    const firstLevel =
      distanceBetween(firstChar, charSet.firstNegative, charSet) + 1;
    return (
      firstLevel +
      integerLengthFromSecondLevel(head.slice(1), "negative", charSet)
    );
  }
  const isPositiveRange = firstChar >= charSet.firstPositive;
  if (isPositiveRange) {
    return distanceBetween(firstChar, charSet.firstPositive, charSet) + 2;
  } else {
    return distanceBetween(firstChar, charSet.firstNegative, charSet) + 2;
  }
}

function integerLengthFromSecondLevel(
  key: string,
  direction: "positive" | "negative",
  charSet: IndexedCharacterSet
): number {
  const firstChar = key[0];
  if (firstChar > charSet.mostPositive || firstChar < charSet.mostNegative) {
    throw new Error("invalid firstChar on key");
  }
  if (firstChar === charSet.mostPositive && direction === "positive") {
    const totalPositiveRoom =
      distanceBetween(firstChar, charSet.mostNegative, charSet) + 1;
    return (
      totalPositiveRoom +
      integerLengthFromSecondLevel(key.slice(1), direction, charSet)
    );
  }
  if (firstChar === charSet.mostNegative && direction === "negative") {
    const totalNegativeRoom =
      distanceBetween(firstChar, charSet.mostPositive, charSet) + 1;
    return (
      totalNegativeRoom +
      integerLengthFromSecondLevel(key.slice(1), direction, charSet)
    );
  }
  if (direction === "positive") {
    return distanceBetween(firstChar, charSet.mostNegative, charSet) + 2;
  } else {
    return distanceBetween(firstChar, charSet.mostPositive, charSet) + 2;
  }
}
