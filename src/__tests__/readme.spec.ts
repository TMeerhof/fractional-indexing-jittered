import { IndexGenerator } from "../IndexGenerator";
import { indexCharacterSet } from "../charSet";
import {
  generateJitteredKeyBetween,
  generateKeyBetween,
  generateNJitteredKeysBetween,
} from "../generateKeyBetween";

describe("readme", () => {
  it("should run generator example without errors", () => {
    const generator = new IndexGenerator([]);

    // dummy code, would normally be stored in database or CRDT and updated from there
    const list: string[] = [];
    function updateList(newKey: string) {
      list.push(newKey);
      generator.updateList(list);
    }

    const first = generator.keyStart(); // "a01TB" a0 with jitter
    updateList(first);

    const second = generator.keyEnd(); // "a10Vt" a1 with jitter
    updateList(second);

    const firstAndHalf = generator.keyAfter(first); // "a0fMq" midpoint between firstKey and secondKey
    updateList(firstAndHalf);

    const firstAndQuarter = generator.keyBefore(firstAndHalf); // "a0M3o" midpoint between firstKey and keyInBetween
    updateList(firstAndQuarter);

    // [ 'a01TB', 'a0M3o', 'a0fMq', 'a10Vt' ]
    // [ first, firstAndHalf, firstAndQuarter, second ]
    // console.log(list.sort());
  });

  it("should run generator group code without errors", () => {
    // Jitter is disabled for this example to make the output more readable, but should be preferred in production
    const generator = new IndexGenerator([], {
      useJitter: false,
      groupIdLength: 2,
    });

    const list: string[] = [];
    // dummy code, would normally be stored in database or CRDT and updated from there
    function updateList(orderKey: string) {
      list.push(orderKey);
      generator.updateList(list);
    }

    // same length as groupIdLength
    const group1 = "g1";
    const group2 = "g2";

    // "g1a0" group1 and first key
    const first = generator.keyStart(group1);
    updateList(first);

    // "g1a1"  group1 and first key
    const second = generator.keyEnd(group1);
    updateList(second);

    // "g1a0V" midpoint between first and second
    const firstAndAHalf = generator.keyAfter(first);
    updateList(firstAndAHalf);

    // "g2a0" group2 and first key
    const firstGroup2 = generator.keyStart(group2);
    updateList(firstGroup2);

    // ["g1a0", "g1a0V", "g1a1", "g2a0"]
    // [ first, firstAndAHalf, second, firstGroup2 ]
    // console.log(list.sort());
  });

  it("run generateJitteredKeyBetween", () => {
    const first = generateJitteredKeyBetween(null, null); // "a090d"

    // Insert after 1st
    const second = generateJitteredKeyBetween(first, null); // "a1C1i"

    // Insert after 2nd
    const third = generateJitteredKeyBetween(second, null); // "a28hy"

    // Insert before 1st
    const zeroth = generateJitteredKeyBetween(null, first); // "ZzBYL"

    // Insert in between 2nd and 3rd (midpoint)
    const secondAndHalf = generateJitteredKeyBetween(second, third); // "a1kek"

    // console.log(first, second, third, zeroth, secondAndHalf);
  });

  it("run generateJitteredKeyBetween", () => {
    const first = generateNJitteredKeysBetween(null, null, 2); // ['a061p', 'a18Ev']

    // Insert two keys after 2nd
    generateNJitteredKeysBetween(first[1], null, 2); // ['a23WQ', 'a315m']

    // Insert two keys before 1st
    generateNJitteredKeysBetween(null, first[0], 2); // ['Zy6Gx', 'ZzB7s']

    // Insert two keys in between 1st and 2nd (midpoints)
    // generateNJitteredKeysBetween(second, third, 2); // ['a0SIA', 'a0iDa']
  });

  it("run indexCharacterSet", () => {
    const base90Set = indexCharacterSet({
      chars:
        "!#$%&()*+,./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~",
    });

    const first = generateKeyBetween(null, null, base90Set); // 'Q!'

    // Insert after 1st
    const second = generateKeyBetween(first, null, base90Set); // 'Q#'

    // Insert in between 2nd and 3rd (midpoint)
    const firstAndHalf = generateKeyBetween(first, second, base90Set); // 'Q!Q'

    // Jittering is still recommended to avoid collisions
    const jitteredStart = generateNJitteredKeysBetween(
      null,
      null,
      2,
      base90Set
    ); // [ 'Q!$i8', 'Q#.f}' ]

    // console.log(base90Set.jitterRange); // 145800 (so 3 times less likely to collide than base62)
  });
});
