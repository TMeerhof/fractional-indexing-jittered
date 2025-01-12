import { base62CharSet, indexCharacterSet } from "./charSet";
import {
  addCharSetKeys,
  decrementKey,
  lexicalDistance,
  midPoint,
  subtractCharSetKeys,
} from "./keyAsNumber";

const base10Charset = indexCharacterSet({
  chars: "0123456789",
});

describe("midPoint", () => {
  const charSet = base62CharSet();
  it.each([
    ["a0", "a4", "a8"],
    ["a0", "a3", "a7"],
    ["a0", "b0", "c0"],
    ["a00001", "b00001", "c00001"],
    ["a0", "a0V", "a1"],
  ])("base62:  a:%s mid: %s b:%s", (lower, mid, upper) => {
    expect(midPoint(lower, upper, charSet)).toBe(mid);
  });

  it.each([
    ["0", "1", "2"],
    ["10", "15", "20"],
    ["0", "05", "10"],
  ])("base 10: a:%s mid: %s b:%s", (lower, mid, upper) => {
    expect(midPoint(lower, upper, base10Charset)).toBe(mid);
  });
});

const base62Cases: [a: string, b: string, added: string][] = [
  ["a0", "1", "a1"],
  ["1", "a0", "a1"],
  ["Zz", "1", "a0"],
  ["0a0", "1", "0a1"],
];

const base10Cases: [a: string, b: string, added: string][] = [
  ["1", "5", "6"],
  ["5", "7", "12"],
];

describe("addCharSetKey", () => {
  it.each(base62Cases)("base62 a:%s b: %s added:%s", (a, b, added) => {
    expect(addCharSetKeys(a, b, base62CharSet())).toBe(added);
  });
  it.each(base10Cases)("base10 a: %s b: %s added: %s", (a, b, added) => {
    expect(addCharSetKeys(a, b, base10Charset)).toBe(added);
  });
});

describe("subtractCharSetKeys", () => {
  it.each(base62Cases)("base62 a:%s b: %s added:%s", (a, b, added) => {
    expect(subtractCharSetKeys(added, a, base62CharSet())).toBe(b);
  });
  it.each(base10Cases)("base10 a:%s b: %s added:%s", (a, b, added) => {
    expect(subtractCharSetKeys(added, a, base10Charset)).toBe(b);
  });

  it("should throw if a < b", () => {
    expect(() => subtractCharSetKeys("1", "10", base10Charset)).toThrow();
  });
});

describe("lexicalDistance", () => {
  const charSet = base62CharSet();
  it.each([
    ["a0", "a4", 4],
    ["a", "a4", 4],
    ["a1", "b1", 62],
    ["b1", "a1", 62],
    ["a1", "a2", 1],
    ["a10", "a20", 62],
    ["0a10", "0a20", 62],
  ])("a: %s b: %s distance: %s", (a, b, distance) => {
    expect(lexicalDistance(a, b, charSet)).toBe(distance);
  });
});

describe("decrementKey", () => {
  const charSet = base62CharSet();
  it.each([
    ["a0", "Zz"],
    ["Zz", "Zy"],
    ["a1", "a0"],
    ["b0T", "b0S"],
  ])("a: %s b: %s distance: %s", (key, result) => {
    expect(decrementKey(key, charSet)).toBe(result);
  });
});
