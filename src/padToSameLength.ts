export function makeSameLength(
  a: string,
  b: string,
  pad: "start" | "end",
  fillChar: string,
  forceLength?: number
) {
  const max = forceLength ?? Math.max(a.length, b.length);
  if (pad === "start") {
    return [a.padStart(max, fillChar), b.padStart(max, fillChar)];
  }
  return [a.padEnd(max, fillChar), b.padEnd(max, fillChar)];
}
