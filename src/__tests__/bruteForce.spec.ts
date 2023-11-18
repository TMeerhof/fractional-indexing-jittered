import {
  generateJitteredKeyBetween,
  generateKeyBetween,
  generateNJitteredKeysBetween,
  generateNKeysBetween,
} from "../generateKeyBetween";

describe("brute force", () => {
  it("should generate keys lots of keys and keep them ordered", () => {
    const list = generateNJitteredKeysBetween(null, null, 1000);
    // insert a substantial amount of keys in the middle
    list.splice(
      601,
      0,
      ...generateNJitteredKeysBetween(list[600], list[601], 1000)
    );
    // insert even more keys inside that block
    list.splice(
      801,
      0,
      ...generateNJitteredKeysBetween(list[800], list[801], 1000)
    );
    expect(list.length).toBe(3000);
    expect([...list].sort()).toStrictEqual(list);
  });
  it("should be able to insert on the same position a lot off times", () => {
    const list = generateNKeysBetween(null, null, 3);
    for (let i = 0; i < 1000; i++) {
      const newKey = generateKeyBetween(list[0], list[1]);
      list.splice(1, 0, newKey);
    }
    expect(list.length).toBe(1003);
    expect([...list].sort()).toStrictEqual(list);
  });
  it("should be able to insert on the same position a lot off times", () => {
    const list = generateNJitteredKeysBetween(null, null, 3);
    for (let i = 0; i < 1000; i++) {
      const newKey = generateJitteredKeyBetween(list[0], list[1]);
      list.splice(1, 0, newKey);
    }
    expect(list.length).toBe(1003);
    expect([...list].sort()).toStrictEqual(list);
  });
});
