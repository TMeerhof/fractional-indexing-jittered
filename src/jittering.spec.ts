import { base62CharSet } from "./charSet.js";
import {
  jitterString,
  paddingNeededForJitter,
  padAndJitterString,
  paddingNeededForDistance,
} from "./jittering.js";

beforeEach(() => {
  jest.spyOn(global.Math, "random").mockReturnValue(0.5);
});

afterEach(() => {
  jest.spyOn(global.Math, "random").mockRestore();
});

describe("jitterString", () => {
  it("should return a padded string", () => {
    expect(jitterString("a0000", base62CharSet())).toBe("a06CO");
  });
});

describe("padAndJitterString", () => {
  it("should return a padded string", () => {
    expect(padAndJitterString("a0", 3, base62CharSet())).toBe("a06CO");
  });
});

describe("paddingNeededForJitter", () => {
  it("should return 3 for a key that very close to the next integer", () => {
    expect(paddingNeededForJitter("a0", null, base62CharSet())).toBe(3);
  });
  it("should return 3 for a key that is very close to the upper between", () => {
    expect(paddingNeededForJitter("a000001", "a000002", base62CharSet())).toBe(
      3
    );
  });

  it("should return 0 for a key that has room until the next integer", () => {
    expect(paddingNeededForJitter("a000001", null, base62CharSet())).toBe(0);
  });
  it("should return 2 for a key that just misses a little room", () => {
    expect(paddingNeededForJitter("a01001", "a01C00", base62CharSet())).toBe(2);
  });

  // it("should return 0 for a key that has room until the next integer and the upper", () => {
  //   expect(paddingNeededForJitter("a000001", "a001000", base62CharSet())).toBe(
  //     0
  //   );
  // });
});

describe("paddingNeededForDistance", () => {
  it.each([
    [1, 3],
    [100, 3],
    [45000, 2],
    [100000, 0],
  ])("from %s to be %s", (distance, needed) => {
    expect(paddingNeededForDistance(distance, base62CharSet())).toBe(needed);
  });
});
