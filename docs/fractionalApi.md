# Fractional indexing API
4 functions to generate keys:
- [generateKeyBetween](#generatekeybetween) -> generates a single key between two keys or at the start or end of the list
- [generateNKeysBetween](#generatenkeysbetween) -> generate N consecutive keys between two keys or at the start or end of the list
- [generateJitteredKeyBetween](#generatejitteredkeybetween) -> generates a single key with Jittering
- [generateNJitteredKeysBetween](#generatenjitteredkeysbetween) > generate N consecutive keys with Jittering

1 utility functions
- [indexCharacterSet](#indexcharacterset) -> create a custom character set if you want more control

generateKeyBetween and generateNKeysBetween credits to the [fractional-indexing](../README.md#fractional-indexing) package

### `generateKeyBetween`

Generate a single key in between two points.

```ts
export function generateKeyBetween(
  lower: string | null,
  upper: string | null,
  charSet: IndexedCharSet = base62CharSet() // optional custom character set
): string
```
```ts
import { generateKeyBetween } from 'fractional-indexing-jittered';

const first = generateKeyBetween(null, null); // "a0"

// Insert after 1st
const second = generateKeyBetween(first, null); // "a1"

// Insert after 2nd
const third = generateKeyBetween(second, null); // "a2"

// Insert before 1st
const zeroth = generateKeyBetween(null, first); // "Zz"

// Insert in between 2nd and 3rd (midpoint)
const secondAndHalf = generateKeyBetween(second, third); // "a1V"
```

### `generateNKeysBetween`

Use this when generating multiple keys at some known position, as it spaces out indexes more evenly and leads to shorter keys.

```ts
export function generateNKeysBetween(
  a: string | null,
  b: string | null,
  n: number,
  charSet: IndexedCharSet = base62CharSet() // optional custom character set
): string[]
```

```ts
import { generateNKeysBetween } from 'fractional-indexing-jittered';

const first = generateNKeysBetween(null, null, 2); // ['a0', 'a1']

// Insert two keys after 2nd
generateNKeysBetween(first[1], null, 2); // ['a2', 'a3']

// Insert two keys before 1st
generateNKeysBetween(null, first[0], 2); // ['Zy', 'Zz']

// Insert two keys in between 1st and 2nd (midpoints)
generateNKeysBetween(second, third, 2); // ['a0G', 'a0V']
```

### `generateJitteredKeyBetween`

Generate a single jittered key in between two points, in all other things identical to `generateKeyBetween`.

```ts
export function generateJitteredKeyBetween(
  lower: string | null,
  upper: string | null,
  charSet: IndexedCharSet = base62CharSet() // optional custom character set
): string
```
```ts
import { generateJitteredKeyBetween } from 'fractional-indexing-jittered';

const first = generateJitteredKeyBetween(null, null); // "a07aS"

// Insert after 1st
const second = generateJitteredKeyBetween(first, null); // "a19el"

// Insert after 2nd
const third = generateJitteredKeyBetween(second, null); // "a26wi"

// Insert before 1st
const zeroth = generateJitteredKeyBetween(null, first); // "Zz0LR"

// Insert in between 2nd and 3rd (midpoint)
const secondAndHalf = generateJitteredKeyBetween(second, third); // "a1n6x"
```

### `generateNJitteredKeysBetween`

Use this when generating multiple jittered keys at some known position, as it spaces out indexes more evenly.

```ts
export function generateNJitteredKeysBetween(
  lower: string | null,
  upper: string | null,
  n: number,
  charSet: IndexedCharSet = base62CharSet() // optional custom character set
): string[]
```
```ts
import { generateNJitteredKeysBetween } from 'fractional-indexing-jittered';

const first = generateNJitteredKeysBetween(null, null, 2); // ['a061p', 'a18Ev']

// Insert two keys after 2nd
generateNJitteredKeysBetween(first[1], null, 2); // ['a23WQ', 'a315m']

// Insert two keys before 1st
generateNJitteredKeysBetween(null, first[0], 2); // ['Zy6Gx', 'ZzB7s']

// Insert two keys in between 1st and 2nd (midpoints)
generateNJitteredKeysBetween(second, third, 2); // ['a0SIA', 'a0iDa']
```

### `indexCharacterSet`
index a custom character set, for instance if you want a different character set,
or to tweak the jitter range to get shorter keys or less chance of identical keys.

```ts
export interface indexCharacterSetOptions {
  chars: string; // sorted string of unique characters like "0123456789ABC"
  jitterRange?: number; // default is 1/5 of the total range created by adding 3 characters
  firstPositive?: string; // default is the middle character
  mostPositive?: string; // default is the last character
  mostNegative?: string; // default is the first character
}
export function indexCharacterSet(options: indexCharacterSetOptions): IndexedCharSet;
```
```ts
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

console.log(base90Set.jitterRange); // 145800 (so 3 times less likely to collide than base62)

```