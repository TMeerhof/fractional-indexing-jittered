import { createCharSetDicts, integerLimits, validateChars } from "./charSet.js";

describe("validateCharSet", () => {
  it("should return true for valid charSet", () => {
    expect(() => validateChars("0123456")).not.toThrow();
  });

  it("should throw for to short a charSet", () => {
    expect(() => validateChars("012345")).toThrow();
  });

  it("should throw a unsorted charSet", () => {
    expect(() => validateChars("1234560")).toThrow();
  });
});

describe("createCharSetDicts", () => {
  it("should return the correct index", () => {
    const { byChar } = createCharSetDicts("0123456");
    expect(byChar["0"]).toBe(0);
    expect(byChar["1"]).toBe(1);
    expect(byChar["2"]).toBe(2);
    expect(byChar["3"]).toBe(3);
    expect(byChar["4"]).toBe(4);
    expect(byChar["5"]).toBe(5);
    expect(byChar["6"]).toBe(6);
  });

  it("should return the correct char", () => {
    const { byCode } = createCharSetDicts("0123456");
    expect(byCode[0]).toBe("0");
    expect(byCode[1]).toBe("1");
    expect(byCode[2]).toBe("2");
    expect(byCode[3]).toBe("3");
    expect(byCode[4]).toBe("4");
    expect(byCode[5]).toBe("5");
    expect(byCode[6]).toBe("6");
  });
});

describe("integerLimits", () => {
  it("should return the correct distances", () => {
    const result = integerLimits(createCharSetDicts("01234567"));
    expect(result.firstPositive).toBe("4");
    expect(result.mostPositive).toBe("7");
    expect(result.mostNegative).toBe("0");
  });
  it("should throw for invalid params", () => {
    expect(() => integerLimits(createCharSetDicts("01234567"), "A")).toThrow();
  });
  it("should throw for invalid neutral", () => {
    expect(() => integerLimits(createCharSetDicts("01234567"), "7")).toThrow();
  });
  it("should throw for invalid mostPositive", () => {
    expect(() =>
      integerLimits(createCharSetDicts("01234567"), "4", "6")
    ).toThrow();
  });
  it("should throw for invalid mostNegative", () => {
    expect(() =>
      integerLimits(createCharSetDicts("01234567"), "3", "6", "7")
    ).toThrow();
  });
  it("should throw for mostPositive too close to neutral", () => {
    expect(() =>
      integerLimits(createCharSetDicts("01234567"), "3", "4")
    ).toThrow();
  });
});
