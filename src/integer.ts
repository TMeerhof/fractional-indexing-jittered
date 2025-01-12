import { IndexedCharacterSet, IntegerLimits } from "./charSet";
import { integerLength } from "./integerLength";
import { decrementKey, incrementKey } from "./keyAsNumber";

export function startKey(charSet: IndexedCharacterSet) {
  return charSet.firstPositive + charSet.byCode[0];
}

export function validInteger(integer: string, charSet: IndexedCharacterSet) {
  const length = integerLength(integer, charSet);
  return length === integer.length;
}

export function validateOrderKey(
  orderKey: string,
  charSet: IndexedCharacterSet
) {
  // TODO more checks
  getIntegerPart(orderKey, charSet);
}

export function getIntegerPart(
  orderKey: string,
  charSet: IndexedCharacterSet
): string {
  const head = integerHead(orderKey, charSet);
  const integerPartLength = integerLength(head, charSet);
  if (integerPartLength > orderKey.length) {
    throw new Error("invalid order key length: " + orderKey);
  }
  return orderKey.slice(0, integerPartLength);
}

function validateInteger(integer: string, charSet: IndexedCharacterSet) {
  if (!validInteger(integer, charSet)) {
    throw new Error("invalid integer length: " + integer);
  }
}

export function incrementInteger(
  integer: string,
  charSet: IndexedCharacterSet
) {
  validateInteger(integer, charSet);
  const [head, digs] = splitInteger(integer, charSet);
  const anyNonMaxedDigit = digs
    .split("")
    .some((d) => d !== charSet.byCode[charSet.length - 1]);

  // we have room to increment
  if (anyNonMaxedDigit) {
    const newDigits = incrementKey(digs, charSet);
    return head + newDigits;
  }
  const nextHead = incrementIntegerHead(head, charSet);
  return startOnNewHead(nextHead, "lower", charSet);
}

export function decrementInteger(
  integer: string,
  charSet: IndexedCharacterSet
) {
  validateInteger(integer, charSet);
  const [head, digs] = splitInteger(integer, charSet);
  const anyNonLimitDigit = digs.split("").some((d) => d !== charSet.byCode[0]);

  // we have room to decrement
  if (anyNonLimitDigit) {
    const newDigits = decrementKey(digs, charSet);
    return head + newDigits;
  }
  const nextHead = decrementIntegerHead(head, charSet);
  return startOnNewHead(nextHead, "upper", charSet);
}

export function integerHead(integer: string, charSet: IntegerLimits): string {
  let i = 0;
  if (integer[0] === charSet.mostPositive) {
    while (integer[i] === charSet.mostPositive) {
      i = i + 1;
    }
  }
  if (integer[0] === charSet.mostNegative) {
    while (integer[i] === charSet.mostNegative) {
      i = i + 1;
    }
  }
  return integer.slice(0, i + 1);
}

export function splitInteger(
  integer: string,
  charSet: IndexedCharacterSet
): [string, string] {
  const head = integerHead(integer, charSet);
  const tail = integer.slice(head.length);
  return [head, tail];
}

export function incrementIntegerHead(
  head: string,
  charSet: IndexedCharacterSet
) {
  const inPositiveRange = head >= charSet.firstPositive;
  const nextHead = incrementKey(head, charSet);
  const headIsLimitMax = head[head.length - 1] === charSet.mostPositive;
  const nextHeadIsLimitMax =
    nextHead[nextHead.length - 1] === charSet.mostPositive;

  // we can not leave the head on the limit value, we have no way to know where the head ends
  if (inPositiveRange && nextHeadIsLimitMax) {
    return nextHead + charSet.mostNegative;
  }
  // we are already at the limit of this level, so we need to go up a level
  if (!inPositiveRange && headIsLimitMax) {
    return head.slice(0, head.length - 1);
  }
  return nextHead;
}

export function decrementIntegerHead(
  head: string,
  charSet: IndexedCharacterSet
) {
  const inPositiveRange = head >= charSet.firstPositive;
  const headIsLimitMin = head[head.length - 1] === charSet.mostNegative;
  if (inPositiveRange && headIsLimitMin) {
    const nextLevel = head.slice(0, head.length - 1);
    // we can not leave the head on the limit value, we have no way to know where the head ends
    // so we take one extra step down
    return decrementKey(nextLevel, charSet);
  }

  if (!inPositiveRange && headIsLimitMin) {
    return head + charSet.mostPositive;
  }

  return decrementKey(head, charSet);
}

function startOnNewHead(
  head: string,
  limit: "upper" | "lower",
  charSet: IndexedCharacterSet
) {
  const newLength = integerLength(head, charSet);
  const fillChar =
    limit === "upper" ? charSet.byCode[charSet.length - 1] : charSet.byCode[0];
  return head + fillChar.repeat(newLength - head.length);
}
