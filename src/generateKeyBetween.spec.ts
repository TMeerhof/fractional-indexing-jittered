import { base62CharSet } from "./charSet";
import {
  generateJitteredKeyBetween,
  generateKeyBetween,
  generateNJitteredKeysBetween,
  generateNKeysBetween,
} from "./generateKeyBetween";

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
