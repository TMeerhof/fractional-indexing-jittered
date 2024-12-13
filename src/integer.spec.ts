import {
  startKey,
  integerHead,
  splitInteger,
  incrementInteger,
  incrementIntegerHead,
  decrementIntegerHead,
  decrementInteger,
} from "./integer";
import { base62CharSet, indexCharacterSet } from "./charSet";

describe("startKey", () => {
  it("should return the first key for simple charset", () => {
    const charSet = indexCharacterSet({ chars: "01234567" });
    expect(startKey(charSet)).toBe("40");
  });

  it("should return the first key for the base62FractionalCharset", () => {
    const charSet = base62CharSet();
    expect(startKey(charSet)).toBe("a0");
  });
});

describe("integerHead", () => {
  const charSet = base62CharSet();
  it.each([
    ["a0", "a"],
    ["a1", "a"],
    ["b01", "b"],
    ["Z1", "Z"],
    ["AZ00", "AZ"],
    ["AAZ000", "AAZ"],
    ["zb000", "zb"],
  ])("from %s to be %s", (interPart, expected) => {
    expect(integerHead(interPart, charSet)).toBe(expected);
  });
});

describe("splitInteger", () => {
  const charSet = base62CharSet();
  it.each([
    ["a0", ["a", "0"]],
    ["a1", ["a", "1"]],
    ["b01", ["b", "01"]],
    ["Z1", ["Z", "1"]],
    ["AZ00", ["AZ", "00"]],
    ["AAZ000", ["AAZ", "000"]],
    ["zb000", ["zb", "000"]],
  ])("from %s to be %s", (interPart, expected) => {
    expect(splitInteger(interPart, charSet)).toStrictEqual(expected);
  });
});

const incrementTestCases: [string, string][] = [
  ["a", "b"],
  ["A", "B"],
  ["Z", "a"],
  ["y", "zA"],
  ["zy", "zzA"],
  ["AY", "AZ"],
  ["Az", "A"],
  ["AAz", "AA"],
];

describe("incrementIntegerHead", () => {
  const charSet = base62CharSet();
  it.each(incrementTestCases)("from %s to be %s", (head, expected) => {
    expect(incrementIntegerHead(head, charSet)).toBe(expected);
  });
});

describe("decrementIntegerHead", () => {
  const charSet = base62CharSet();
  // head and expected are reversed because we are decrementing using the same test cases
  it.each(incrementTestCases)("from %s to be %s", (expected, head) => {
    expect(decrementIntegerHead(head, charSet)).toBe(expected);
  });
});

const incrementTestCasesWithTail: [string, string][] = [
  ["az", "b00"],
  ["bzz", "c000"],
  ["yzzzzzzzzzzzzzzzzzzzzzzzzz", "zA00000000000000000000000000"],
];

describe("incrementInteger", () => {
  const charSet = base62CharSet();
  it.each(incrementTestCasesWithTail)(
    "from %s to be %s",
    (interPart, expected) => {
      expect(incrementInteger(interPart, charSet)).toBe(expected);
    }
  );
});

describe("decrementIntegerHead", () => {
  const charSet = base62CharSet();
  it.each(incrementTestCasesWithTail)(
    "to be %s from %s",
    // head and expected are reversed because we are decrementing using the same test cases
    (expected, interPart) => {
      expect(decrementInteger(interPart, charSet)).toBe(expected);
    }
  );
});
