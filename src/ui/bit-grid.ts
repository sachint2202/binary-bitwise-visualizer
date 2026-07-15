//render bit grid
import { splitIntoBytes } from "../core/binary.ts";
export function createBitGrid(binary: string, previousBinary?: string): string {
  const rows = splitIntoBytes(binary);
  return rows
    .map((row, rowIndex) => {
      return `<div class="byte">${row
        .split("")
        .map((bit, bitIndex) => {
          const absoluteIndex = rowIndex * 8 + bitIndex;
          const changed =
            previousBinary && previousBinary[absoluteIndex] !== bit;
          return `<span class="bit bit-${bit} ${changed ? "bit-changed" : ""}">${bit}</span>`;
        })
        .join("")}</div>`;
    })
    .join("");
}
