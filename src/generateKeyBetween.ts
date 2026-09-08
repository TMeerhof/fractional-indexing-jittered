import { IndexedCharacterSet, base62CharSet } from "./charSet";
import {
  decrementInteger,
  getIntegerPart,
  incrementInteger,
  startKey,
  stripTrailingZeros,
  validateOrderKey,
} from "./integer";
import {
  jitterString,
  paddingNeededForJitter,
  padAndJitterString,
} from "./jittering";
import { midPoint } from "./keyAsNumber";

/**
 * Generate a key between two other keys.
 * If either lower or upper is null, the key will be generated at the start or end of the list.
 */
export function generateKeyBetween(
  lower: string | null,
  upper: string | null,
  charSet: IndexedCharacterSet = base62CharSet()
): string {
  return stripRedundantZeros(keyBetween(lower, upper, charSet), lower, charSet);
}

/**
 * The raw key between two keys, which can still carry redundant trailing zeros.
 *
 * The jitter path needs the raw key: jitterString adds its shift right aligned, so the magnitude
 * of the shift depends on the length of the key it is added to, and paddingNeededForJitter sizes
 * that padding against this key. Stripping a character here would multiply the shift by the
 * charSet length and let it overshoot the upper bound.
 */
function keyBetween(
  lower: string | null,
  upper: string | null,
  charSet: IndexedCharacterSet
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
 * Strip the redundant trailing zeros a generated key can pick up: the midpoint can land on a
 * multiple of the charSet length ("a000" .. "a020" -> "a010"), and the random jitter shift can
 * end on the zero character or leave the padding padAndJitterString added in place.
 *
 * Never at the cost of the ordering though. Stripping lowers the key, and for a degenerate range
 * that has no room for a key at all ("a01" .. "a010") the stripped key would land on the lower
 * bound, so there we keep the key as it was.
 */
function stripRedundantZeros(
  key: string,
  lower: string | null,
  charSet: IndexedCharacterSet
): string {
  const stripped = stripTrailingZeros(key, charSet);
  if (lower !== null && stripped <= lower) {
    return key;
  }
  return stripped;
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
  const key = keyBetween(lower, upper, charSet);
  const paddingNeeded = paddingNeededForJitter(key, upper, charSet);
  const jittered = paddingNeeded
    ? padAndJitterString(key, paddingNeeded, charSet)
    : jitterString(key, charSet);
  return stripRedundantZeros(jittered, lower, charSet);
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
