import { IndexedCharacterSet, base62CharSet } from "./charSet.js";
import {
  decrementInteger,
  getIntegerPart,
  incrementInteger,
  startKey,
  validateOrderKey,
} from "./integer.js";
import {
  jitterString,
  paddingNeededForJitter,
  padAndJitterString,
} from "./jittering.js";
import { midPoint } from "./keyAsNumber.js";

/**
 * Generate a key between two other keys.
 * If either lower or upper is null, the key will be generated at the start or end of the list.
 */
export function generateKeyBetween(
  lower: string | null,
  upper: string | null,
  charSet: IndexedCharacterSet = base62CharSet()
): string {
  if (lower !== null) {
    validateOrderKey(lower, charSet);
  }
  if (upper !== null) {
    validateOrderKey(upper, charSet);
  }
  if (lower === null && upper === null) {
    return startKey(charSet);
  }
  if (lower === null) {
    const integer = getIntegerPart(upper!, charSet);
    return decrementInteger(integer, charSet);
  }
  if (upper === null) {
    const integer = getIntegerPart(lower, charSet);
    return incrementInteger(integer, charSet);
  }
  if (lower >= upper) {
    throw new Error(lower + " >= " + upper);
  }
  return midPoint(lower, upper, charSet);
}

/**
 * Generate any number of keys between two other keys.
 * If either lower or upper is null, the keys will be generated at the start or end of the list.
 */
export function generateNKeysBetween(
  a: string | null,
  b: string | null,
  n: number,
  charSet: IndexedCharacterSet = base62CharSet()
): string[] {
  return spreadGeneratorResults(
    a,
    b,
    n,
    charSet,
    generateKeyBetween,
    generateNKeysBetween
  );
}

/**
 * Generate a key between two other keys with jitter.
 * If either lower or upper is null, the key will be generated at the start or end of the list.
 */
export function generateJitteredKeyBetween(
  lower: string | null,
  upper: string | null,
  charSet: IndexedCharacterSet = base62CharSet()
): string {
  const key = generateKeyBetween(lower, upper, charSet);
  const paddingNeeded = paddingNeededForJitter(key, upper, charSet);
  if (paddingNeeded) {
    return padAndJitterString(key, paddingNeeded, charSet);
  }
  return jitterString(key, charSet);
}

/**
 * Generate any number of keys between two other keys with jitter.
 * If either lower or upper is null, the keys will be generated at the start or end of the list.
 */
export function generateNJitteredKeysBetween(
  lower: string | null,
  upper: string | null,
  n: number,
  charSet: IndexedCharacterSet = base62CharSet()
): string[] {
  return spreadGeneratorResults(
    lower,
    upper,
    n,
    charSet,
    generateJitteredKeyBetween,
    generateNJitteredKeysBetween
  );
}

function spreadGeneratorResults(
  lower: string | null,
  upper: string | null,
  n: number,
  charSet: IndexedCharacterSet,
  generateKey: GenerateKeyBetweenFunc,
  generateNKeys: GenerateNKeysBetweenFunc
) {
  if (n === 0) {
    return [];
  }
  if (n === 1) {
    return [generateKey(lower, upper, charSet)];
  }
  if (upper == null) {
    let newUpper = generateKey(lower, upper, charSet);
    const result = [newUpper];
    for (let i = 0; i < n - 1; i++) {
      newUpper = generateKey(newUpper, upper, charSet);
      result.push(newUpper);
    }
    return result;
  }
  if (lower == null) {
    let newLower = generateKey(lower, upper, charSet);
    const result = [newLower];
    for (let i = 0; i < n - 1; i++) {
      newLower = generateKey(lower, newLower, charSet);
      result.push(newLower);
    }
    result.reverse();
    return result;
  }
  const mid = Math.floor(n / 2);
  const midOrderKey = generateKey(lower, upper, charSet);
  return [
    ...generateNKeys(lower, midOrderKey, mid, charSet),
    midOrderKey,
    ...generateNKeys(midOrderKey, upper, n - mid - 1, charSet),
  ];
}
type GenerateKeyBetweenFunc = (
  lower: string | null,
  upper: string | null,
  charSet?: IndexedCharacterSet
) => string;
type GenerateNKeysBetweenFunc = (
  lower: string | null,
  upper: string | null,
  n: number,
  charSet?: IndexedCharacterSet
) => string[];
