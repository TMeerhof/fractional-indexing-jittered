import { base62CharSet } from "./charSet";
import {
  generateJitteredKeyBetween,
  generateKeyBetween,
  generateNJitteredKeysBetween,
  generateNKeysBetween,
} from "./generateKeyBetween";
import { validInteger } from "./integer";

// We need to mock Math.random() to get consistent results
// 0.5 * default Jitter range === '6CO'
beforeAll(() => {
  jest.spyOn(global.Math, "random").mockReturnValue(0.5);
});

afterAll(() => {
  jest.spyOn(global.Math, "random").mockRestore();
});

describe("generateKeyBetween", () => {
  const charSet = base62CharSet();
  it.each([
    // a, expected, b
    [null, "a0", null],
    [null, "a0", "a1"],
    [null, "Zz", "a0"],
    [null, "b0S", "b0T"],
    ["b0S", "b0T", null],
    ["a0", "a4", "a8"],
    ["a0", "a0V", "a1"],
    // the midpoint lands on a multiple of the charSet length, so the trailing zero is stripped
    ["a000", "a01", "a020"],
    // digits start with the zero character, which the decrement has to keep
    [null, "Y0y", "Y0z"],
    // the digits are exhausted, so the head steps down to the next integer length
    [null, "Xzzz", "Y00"],
  ])("a:%s mid: %s b:%s", (a, expected, b) => {
    expect(generateKeyBetween(a, b, charSet)).toBe(expected);
  });

  it("should throw if a >= b", () => {
    expect(() => generateKeyBetween("a0", "a0", charSet)).toThrow();
    expect(() => generateKeyBetween("a1", "a0", charSet)).toThrow();
  });
});

describe("generateJitteredKeyBetween", () => {
  const charSet = base62CharSet();
  it.each([
    // a, expected, b
    [null, "a06CO", null],
    [null, "a06CO", "a1"],
    [null, "Zz6CO", "a0"],
    [null, "b0S6CO", "b0T46n"],
    ["b0S", "b0T6CO", null],
    ["a0", "a46CO", "a8"],
    ["a0", "a0V6CO", "a1"],
  ])("a:%s mid: %s b:%s, should not mess up integer part", (a, expected, b) => {
    expect(generateJitteredKeyBetween(a, b, charSet)).toBe(expected);
  });
});

describe("generateNKeysBetween", () => {
  const charSet = base62CharSet();
  it('should generate 3 keys between "a0" and "a1"', () => {
    const keys = generateNKeysBetween("a0", "a1", 3, charSet);
    expect(keys.length).toBe(3);
    expect(keys).toStrictEqual(["a0F", "a0V", "a0k"]);
  });

  it('should generate 3 keys after "b01" ', () => {
    const keys = generateNKeysBetween("b01", null, 3, charSet);
    expect(keys.length).toBe(3);
    expect(keys).toStrictEqual(["b02", "b03", "b04"]);
  });

  it('should generate 3 keys before "a0" ', () => {
    const keys = generateNKeysBetween(null, "a0", 3, charSet);
    expect(keys.length).toBe(3);
    expect(keys).toStrictEqual(["Zx", "Zy", "Zz"]);
  });
});

describe("generateNJitteredKeysBetween", () => {
  const charSet = base62CharSet();
  it('should generate 3 keys between "a0" and "a1"', () => {
    const keys = generateNJitteredKeysBetween("a0", "a1", 3, charSet);
    expect(keys.length).toBe(3);
    expect(keys).toStrictEqual(["a0FeIa", "a0V6CO", "a0keIa"]);
  });
});

describe("generateKeyBetween prepending repeatedly", () => {
  const charSet = base62CharSet();

  // Prepending walks the integer part down through the digit-length boundaries. Before 1.0.0 the
  // walk broke at the first integer with a leading zero digit (Y0z -> Yy), 3846 steps in. 5000
  // steps clears that and the Y -> X head boundary at step 3908, but stops well inside the X
  // range, which is 62^3 steps long.
  it("keeps producing valid, strictly decreasing integers past the Y -> X boundary", () => {
    let key: string | null = null;
    let previous: string | null = null;

    for (let i = 0; i < 5000; i++) {
      key = generateKeyBetween(null, key, charSet);
      // a prepend returns a bare integer, so its length has to match the length its head promises
      expect(validInteger(key, charSet)).toBe(true);
      if (previous !== null) {
        expect(key < previous).toBe(true);
      }
      previous = key;
    }
  });
});
