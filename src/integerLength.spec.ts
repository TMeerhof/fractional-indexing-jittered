import { base62CharSet, indexCharacterSet } from "./charSet.js";
import { distanceBetween, integerLength } from "./integerLength.js";

describe("distanceNeutral", () => {
  const charSet = base62CharSet();

  it.each([
    ["a", 0],
    ["Z", 1],
    ["b", 1],
    ["A", 26],
    ["z", 25],
  ])("from %s to be %s", (interPart, expectedLength) => {
    expect(distanceBetween(interPart, charSet.firstPositive, charSet)).toBe(
      expectedLength
    );
  });
});

describe("integerLength", () => {
  const charSet = base62CharSet();
  it.each([
    // Positive
    ["a", 2],
    ["b", 3],
    ["y", 26],
    ["zA", 28],
    ["zB", 29],
    ["zC", 30],
    ["zx", 77],
    ["zy", 78],
    ["zzA", 80],
    ["zzy", 130],
    ["zzzA", 132],
    // Negative
    ["Z", 2],
    ["B", 26],
    ["Az", 28],
    ["Ay", 29],
    ["AB", 78],
    ["AAz", 80],
    ["AAB", 130],
    ["AAAz", 132],
  ])("from %s to be %s", (interPart, expectedLength) => {
    expect(integerLength(interPart, charSet)).toBe(expectedLength);
  });

  it("should throw for invalid head", () => {
    expect(() => integerLength("0", charSet)).toThrow();
  });

  it("should throw for invalid head on second level", () => {
    expect(() => integerLength("A0", charSet)).toThrow();
  });
});
