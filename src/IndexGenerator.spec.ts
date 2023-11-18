import { IndexGenerator } from "./IndexGenerator.js"; // Adjust this import according to your project structure

describe("Basic Generator", () => {
  let generator: IndexGenerator;
  beforeAll(() => {
    generator = new IndexGenerator([], { useJitter: false });
  });

  it("is should generate correct keys for a empty list", () => {
    const key1 = generator.keyStart();
    expect(key1).toBe("a0");
    const key2 = generator.keyEnd();
    expect(key2).toBe("a0");
    const keysStart = generator.nKeysStart(2);
    expect(keysStart).toStrictEqual(["a0", "a1"]);
    const keysEnd = generator.nKeysEnd(2);
    expect(keysEnd).toStrictEqual(["a0", "a1"]);
  });

  it("is should generate correct start keys for populated list", () => {
    generator.updateList(["a0"]);
    const key = generator.keyStart();
    const keys = generator.nKeysStart(2);
    expect(key).toBe("Zz");
    expect(keys).toStrictEqual(["Zy", "Zz"]);
  });

  it("is should generate correct end keys for populated list", () => {
    generator.updateList(["a1"]);
    const key = generator.keyEnd();
    const keys = generator.nKeysEnd(2);
    expect(key).toBe("a2");
    expect(keys).toStrictEqual(["a2", "a3"]);
  });

  it("is should generate correct keys after if last item", () => {
    generator.updateList(["a1"]);
    const key = generator.keyAfter("a1");
    const keys = generator.nKeysAfter("a1", 2);
    expect(key).toBe("a2");
    expect(keys).toStrictEqual(["a2", "a3"]);
  });

  it("is should generate correct keys after not last item", () => {
    generator.updateList(["a1", "a2"]);
    const key = generator.keyAfter("a1");
    const keys = generator.nKeysAfter("a1", 3);
    expect(key).toBe("a1V");
    expect(keys).toStrictEqual(["a1F", "a1V", "a1k"]);
  });

  it("is should generate correct keys before if first item", () => {
    generator.updateList(["a5"]);
    const key = generator.keyBefore("a5");
    const keys = generator.nKeysBefore("a5", 2);
    expect(key).toBe("a4");
    expect(keys).toStrictEqual(["a3", "a4"]);
  });

  it("is should generate correct keys after not last item", () => {
    generator.updateList(["a1", "a2"]);
    const key = generator.keyAfter("a1");
    const keys = generator.nKeysAfter("a1", 3);
    expect(key).toBe("a1V");
    expect(keys).toStrictEqual(["a1F", "a1V", "a1k"]);
  });

  it("is should generate correct keys before if not first item", () => {
    generator.updateList(["a1", "a2"]);
    const key = generator.keyBefore("a2");
    const keys = generator.nKeysBefore("a2", 3);
    expect(key).toBe("a1V");
    expect(keys).toStrictEqual(["a1F", "a1V", "a1k"]);
  });
});

describe("Jittered Generator", () => {
  let generator: IndexGenerator;
  // We need to mock Math.random() to get consistent results
  // 0.5 * default Jitter range === '6CO'
  beforeAll(() => {
    jest.spyOn(global.Math, "random").mockReturnValue(0.5);
    generator = new IndexGenerator([], { useJitter: true });
  });

  afterAll(() => {
    jest.spyOn(global.Math, "random").mockRestore();
  });

  it("is should generate correct jittered keys", () => {
    const keys = generator.nKeysStart(3);
    expect(keys).toStrictEqual(["a06CO", "a16CO", "a26CO"]);
  });
});

describe("Group Generator", () => {
  let generator: IndexGenerator;
  beforeAll(() => {
    generator = new IndexGenerator([], { useJitter: false, groupIdLength: 2 });
  });
  it("is should generate correct keys for a empty list", () => {
    const key1 = generator.keyStart("g1");
    expect(key1).toBe("g1a0");
    const key2 = generator.keyEnd("g1");
    expect(key2).toBe("g1a0");
    const keysStart = generator.nKeysStart(2, "g1");
    expect(keysStart).toStrictEqual(["g1a0", "g1a1"]);
    const keysEnd = generator.nKeysEnd(2, "g1");
    expect(keysEnd).toStrictEqual(["g1a0", "g1a1"]);
  });

  it("should throw if groupId is not supplied", () => {
    expect(() => generator.keyStart()).toThrow();
  });

  it("should throw if groupId is incorrect length", () => {
    expect(() => generator.keyStart("group1")).toThrow();
  });

  it("is should generate correct start keys for populated list", () => {
    generator.updateList(["g1a0"]);
    const key = generator.keyStart("g1");
    const keys = generator.nKeysStart(2, "g1");
    expect(key).toBe("g1Zz");
    expect(keys).toStrictEqual(["g1Zy", "g1Zz"]);
  });

  it("is should generate correct end keys for populated list", () => {
    generator.updateList(["g1a1"]);
    const key = generator.keyEnd("g1");
    const keys = generator.nKeysEnd(2, "g1");
    expect(key).toBe("g1a2");
    expect(keys).toStrictEqual(["g1a2", "g1a3"]);
  });

  it("is should generate correct keys after if last item", () => {
    generator.updateList(["g1a1"]);
    const key = generator.keyAfter("g1a1");
    const keys = generator.nKeysAfter("g1a1", 2);
    expect(key).toBe("g1a2");
    expect(keys).toStrictEqual(["g1a2", "g1a3"]);
  });

  it("is should generate correct keys after not last item", () => {
    generator.updateList(["g1a1", "g1a2"]);
    const key = generator.keyAfter("g1a1");
    const keys = generator.nKeysAfter("g1a1", 3);
    expect(key).toBe("g1a1V");
    expect(keys).toStrictEqual(["g1a1F", "g1a1V", "g1a1k"]);
  });

  it("is should generate correct keys before if first item", () => {
    generator.updateList(["g1a5"]);
    const key = generator.keyBefore("g1a5");
    const keys = generator.nKeysBefore("g1a5", 2);
    expect(key).toBe("g1a4");
    expect(keys).toStrictEqual(["g1a3", "g1a4"]);
  });

  it("is should generate correct keys after not last item", () => {
    generator.updateList(["g1a1", "g1a2"]);
    const key = generator.keyAfter("g1a1");
    const keys = generator.nKeysAfter("g1a1", 3);
    expect(key).toBe("g1a1V");
    expect(keys).toStrictEqual(["g1a1F", "g1a1V", "g1a1k"]);
  });

  it("is should generate correct keys before if not first item", () => {
    generator.updateList(["g1a1", "g1a2"]);
    const key = generator.keyBefore("g1a2");
    const keys = generator.nKeysBefore("g1a2", 3);
    expect(key).toBe("g1a1V");
    expect(keys).toStrictEqual(["g1a1F", "g1a1V", "g1a1k"]);
  });

  it("is should generate correct new start key for populated list and different group", () => {
    generator.updateList(["g1a5"]);
    const key1 = generator.keyStart("g2");
    expect(key1).toBe("g2a0");
  });
});
