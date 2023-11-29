# generator

Generator is a utility class for using the fractional index API, 
best introduction is the [quick start](../README.md#generator-quick-start) on the main Readme

## Generator Groups

The generator supports groups, so you can have one ordered lists with multiple sections.
You are responsible for giving the groups a name that can be alphabetically ordered.

```ts
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
console.log(list.sort());
```

## Generator API


### Constructor

```ts
interface GeneratorOptions {
  charSet?: IndexedCharSet;
  useJitter?: boolean;
  groupIdLength?: number;
}
new IndexGenerator(list: string[], options: GeneratorOptions = {})
```

### Class methods
```ts
/**
 * Updates the list that the generator uses to generate keys.
 * The generator will not mutate the internal list when generating keys.
 */
updateList(list: string[])

/**
 * Generate any number of keys at the start of the list (before the first key).
 * Optionally you can supply a groupId to generate keys at the start of a specific group.
 */
nKeysStart(n: number, groupId?: string): string[]

/**
 * Generate a single key at the start of the list (before the first key).
 * Optionally you can supply a groupId to generate a key at the start of a specific group.
 */
keyStart(groupId?: string): string

/**
 * Generate any number of keys at the end of the list (after the last key).
 * Optionally you can supply a groupId to generate keys at the end of a specific group.
 */
nKeysEnd(n: number, groupId?: string): string[]

/**
 * Generate a single key at the end of the list (after the last key).
 * Optionally you can supply a groupId to generate a key at the end of a specific group.
 */
keyEnd(groupId?: string): string
/**
 * Generate any number of keys behind a specific key and in front of the next key.
 * GroupId will be inferred from the orderKey if working with groups
 */
nKeysAfter(orderKey: string, n: number): string[]

/**
 * Generate a single key behind a specific key and in front of the next key.
 * GroupId will be inferred from the orderKey if working with groups
 */
keyAfter(orderKey: string): string

/**
 * Generate any number of keys in front of a specific key and behind the previous key.
 * GroupId will be inferred from the orderKey if working with groups
 */
nKeysBefore(orderKey: string, n: number): string[]

/**
 * Generate a single key in front of a specific key and behind the previous key.
 * GroupId will be inferred from the orderKey if working with groups
 */
keyBefore(orderKey: string): string
```


