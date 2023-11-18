export interface IndexCharacterSetOptions {
  chars: string; // sorted string of unique characters like "0123456789ABC"
  jitterRange?: number; // default is 1/5 of the total range created by adding 3 characters
  firstPositive?: string; // default is the middle character
  mostPositive?: string; // default is the last character
  mostNegative?: string; // default is the first character
}

export interface IndexedCharacterSet {
  chars: string;
  byChar: Record<string, number>;
  byCode: Record<number, string>;
  paddingDict: Record<number, number>;
  length: number;
  first: string;
  last: string;
  firstPositive: string;
  mostPositive: string;
  firstNegative: string;
  mostNegative: string;
  jitterRange: number;
}

export function indexCharacterSet(
  options: IndexCharacterSetOptions
): IndexedCharacterSet {
  const dicts = createCharSetDicts(options.chars);
  const limits = integerLimits(
    dicts,
    options.firstPositive,
    options.mostPositive,
    options.mostNegative
  );
  // 1/5 of the total range if we add 3 characters, TODO: feels a bit arbitrary and could be improved
  const jitterRange =
    options.jitterRange ?? Math.floor(Math.pow(dicts.length, 3) / 5);

  const paddingRange = paddingDict(jitterRange, dicts.length);

  return {
    chars: options.chars,
    byChar: dicts.byChar,
    byCode: dicts.byCode,
    length: dicts.length,
    first: dicts.byCode[0],
    last: dicts.byCode[dicts.length - 1],
    firstPositive: limits.firstPositive,
    mostPositive: limits.mostPositive,
    firstNegative: limits.firstNegative,
    mostNegative: limits.mostNegative,
    jitterRange,
    paddingDict: paddingRange,
  };
}

export function validateChars(characters: string): void {
  if (characters.length < 7) {
    throw new Error("charSet must be at least 7 characters long");
  }
  const chars = characters.split("");
  const sorted = chars.sort();
  const isEqual = sorted.join("") === characters;
  if (!isEqual) {
    throw new Error("charSet must be sorted");
  }
}

type CharSetDicts = ReturnType<typeof createCharSetDicts>;
export function createCharSetDicts(charSet: string) {
  const byCode: Record<number, string> = {};
  const byChar: Record<string, number> = {};
  const length = charSet.length;

  for (let i = 0; i < length; i++) {
    const char = charSet[i];
    byCode[i] = char;
    byChar[char] = i;
  }
  return {
    byCode: byCode,
    byChar: byChar,
    length: length,
  };
}

export type IntegerLimits = ReturnType<typeof integerLimits>;
export function integerLimits(
  dicts: CharSetDicts,
  firstPositive?: string,
  mostPositive?: string,
  mostNegative?: string
) {
  const firstPositiveIndex = firstPositive
    ? dicts.byChar[firstPositive]
    : Math.ceil(dicts.length / 2);
  const mostPositiveIndex = mostPositive
    ? dicts.byChar[mostPositive]
    : dicts.length - 1;
  const mostNegativeIndex = mostNegative ? dicts.byChar[mostNegative] : 0;
  if (
    firstPositiveIndex === undefined ||
    mostPositiveIndex === undefined ||
    mostNegativeIndex === undefined
  ) {
    throw new Error("invalid charSet");
  }
  if (mostPositiveIndex - firstPositiveIndex < 3) {
    throw new Error(
      "mostPositive must be at least 3 characters away from neutral"
    );
  }
  if (firstPositiveIndex - mostNegativeIndex < 3) {
    throw new Error(
      "mostNegative must be at least 3 characters away from neutral"
    );
  }

  return {
    firstPositive: dicts.byCode[firstPositiveIndex],
    mostPositive: dicts.byCode[mostPositiveIndex],
    firstNegative: dicts.byCode[firstPositiveIndex - 1],
    mostNegative: dicts.byCode[mostNegativeIndex],
  };
}

// cache calculated distance for performance, TODO: is this needed?
export function paddingDict(jitterRange: number, charSetLength: number) {
  const paddingDict: Record<number, number> = {};
  let distance = 0;
  for (let i = 0; i < 100; i++) {
    paddingDict[i] = Math.pow(charSetLength, i);
    if (paddingDict[i] > jitterRange) {
      break;
    }
  }
  return paddingDict;
}

// cache the base62 charSet since it's the default
let _base62CharSet: IndexedCharacterSet | null = null;

export function base62CharSet(): IndexedCharacterSet {
  if (_base62CharSet) return _base62CharSet;
  return (_base62CharSet = indexCharacterSet({
    // Base62 are all the alphanumeric characters, database and user friendly
    // For shorter strings and more room you could opt for more characters
    chars: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    // This gives us nice human readable keys to start with a0 a1 etc
    firstPositive: "a",
    mostPositive: "z",
    mostNegative: "A",
  }));
}
