import { IndexedCharacterSet, base62CharSet } from "./charSet.js";
import { makeSameLength } from "./padToSameLength.js";

/**
 * Returns the midpoint between two string keys based on a given charSet.
 */
export function midPoint(
  lower: string,
  upper: string,
  charSet: IndexedCharacterSet
): string {
  let [paddedLower, paddedUpper] = makeSameLength(
    lower,
    upper,
    "end",
    charSet.first
  );
  let distance = lexicalDistance(paddedLower, paddedUpper, charSet);
  if (distance === 1) {
    // if the numbers are consecutive we need more padding
    paddedLower = paddedLower.padEnd(paddedLower.length + 1, charSet.first);
    // the new distance will always be the length of the charSet
    distance = charSet.length;
  }
  const mid = encodeToCharSet(Math.floor(distance / 2), charSet);
  return addCharSetKeys(paddedLower, mid, charSet);
}

/**
the distance between two keys when sorting them as strings
this is not the same as the distance between the numbers they encode
 */
export function lexicalDistance(
  a: string,
  b: string,
  charSet: IndexedCharacterSet
) {
  const [lower, upper] = makeSameLength(a, b, "end", charSet.first).sort();
  const distance = subtractCharSetKeys(upper, lower, charSet);
  return decodeCharSetToNumber(distance, charSet);
}

export function addCharSetKeys(
  a: string,
  b: string,
  charSet: IndexedCharacterSet
): string {
  const base = charSet.length;
  const [paddedA, paddedB] = makeSameLength(a, b, "start", charSet.first);

  const result: string[] = [];
  let carry = 0;

  // Iterate over the digits from right to left
  for (let i = paddedA.length - 1; i >= 0; i--) {
    const digitA = charSet.byChar[paddedA[i]];
    const digitB = charSet.byChar[paddedB[i]];
    const sum = digitA + digitB + carry;
    carry = Math.floor(sum / base);
    const remainder = sum % base;

    result.unshift(charSet.byCode[remainder]);
  }

  // If there's a carry left, add it to the result
  if (carry > 0) {
    result.unshift(charSet.byCode[carry]);
  }

  return result.join("");
}

export function subtractCharSetKeys(
  a: string,
  b: string,
  charSet: IndexedCharacterSet
): string {
  const base = charSet.length;
  const [paddedA, paddedB] = makeSameLength(a, b, "start", charSet.first);

  const result: string[] = [];
  let borrow = 0;

  // Iterate over the digits from right to left
  for (let i = paddedA.length - 1; i >= 0; i--) {
    let digitA = charSet.byChar[paddedA[i]];
    const digitB = charSet.byChar[paddedB[i]] + borrow;

    // Handle borrowing
    if (digitA < digitB) {
      borrow = 1;
      digitA += base;
    } else {
      borrow = 0;
    }

    const difference = digitA - digitB;
    result.unshift(charSet.byCode[difference]);
  }

  // If there's a borrow left, we have a negative result, which is not supported
  if (borrow > 0) {
    throw new Error(
      "Subtraction result is negative. Ensure a is greater than or equal to b."
    );
  }

  // Remove leading zeros
  while (result.length > 1 && result[0] === charSet.byCode[0]) {
    result.shift();
  }

  return result.join("");
}

export function incrementKey(key: string, charSet: IndexedCharacterSet) {
  return addCharSetKeys(key, charSet.byCode[1], charSet);
}

export function decrementKey(key: string, charSet: IndexedCharacterSet) {
  return subtractCharSetKeys(key, charSet.byCode[1], charSet);
}

export function encodeToCharSet(int: number, charSet: IndexedCharacterSet) {
  if (int === 0) {
    return charSet.byCode[0];
  }
  let res = "";
  const max = charSet.length;
  while (int > 0) {
    res = charSet.byCode[int % max] + res;
    int = Math.floor(int / max);
  }
  return res;
}

// be careful not to use this for full order keys, as javascript will loose precision with numbers from 2^53
// using base62 that can already happen with 9 characters
export function decodeCharSetToNumber(
  key: string,
  charSet: IndexedCharacterSet
) {
  let res = 0;
  const length = key.length;
  const max = charSet.length;
  for (let i = 0; i < length; i++) {
    res += charSet.byChar[key[i]] * Math.pow(max, length - i - 1);
  }
  return res;
}
