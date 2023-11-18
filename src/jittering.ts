import { IndexedCharacterSet } from "./charSet.js";
import { getIntegerPart, incrementInteger } from "./integer.js";
import {
  addCharSetKeys,
  encodeToCharSet,
  lexicalDistance,
} from "./keyAsNumber.js";

export function jitterString(
  orderKey: string,
  charSet: IndexedCharacterSet
): string {
  const shift = encodeToCharSet(
    Math.floor(Math.random() * charSet.jitterRange),
    charSet
  );
  return addCharSetKeys(orderKey, shift, charSet);
}

export function padAndJitterString(
  orderKey: string,
  numberOfChars: number,
  charSet: IndexedCharacterSet
): string {
  const paddedKey = orderKey.padEnd(
    orderKey.length + numberOfChars,
    charSet.first
  );
  return jitterString(paddedKey, charSet);
}

export function paddingNeededForJitter(
  orderKey: string,
  b: string | null,
  charSet: IndexedCharacterSet
): number {
  const integer = getIntegerPart(orderKey, charSet);
  const nextInteger = incrementInteger(integer, charSet);
  let needed = 0;
  if (b !== null) {
    const distanceToB = lexicalDistance(orderKey, b, charSet);
    if (distanceToB < charSet.jitterRange + 1) {
      needed = Math.max(needed, paddingNeededForDistance(distanceToB, charSet));
    }
  }
  const distanceToNextInteger = lexicalDistance(orderKey, nextInteger, charSet);
  if (distanceToNextInteger < charSet.jitterRange + 1) {
    needed = Math.max(
      needed,
      paddingNeededForDistance(distanceToNextInteger, charSet)
    );
  }

  return needed;
}

export function paddingNeededForDistance(
  distance: number,
  charSet: IndexedCharacterSet
): number {
  const gap = charSet.jitterRange - distance;
  const firstBigger = Object.entries(charSet.paddingDict).find(
    ([_key, value]) => {
      return value > gap;
    }
  );

  return firstBigger ? parseInt(firstBigger[0]) : 0;
}
