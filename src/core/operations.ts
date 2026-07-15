import type { BinaryOperation, UnaryOperation } from "../types/operation";

export const unaryOperations: UnaryOperation[] = [
  {
    id: "not",
    label: "NOT",
    execute: bitwiseNot,
    explanation: "Flips every bit. 0 become 1 and 1 becomes 0.",
  },
];
export const binaryOprations: BinaryOperation[] = [
  {
    id: "and",
    label: "AND",
    execute: bitwiseAnd,
    explanation: "Performs a logical AND operation on each pair of bits.",
  },
  {
    id: "or",
    label: "OR",
    execute: bitwiseOr,
    explanation: "Performs a logical OR operation on each pair of bits.",
  },
  {
    id: "xor",
    label: "XOR",
    execute: bitwiseXor,
    explanation:
      "Performs a logical XOR operation on each pair of bits. Result is 1 if the bits are different, otherwise 0.",
  },
  {
    id: "leftShift",
    label: "Left Shift",
    execute: leftShift,
    explanation:
      "Shifts all bits to the left by a specified number of positions. New bits on the right are filled with 0s.",
  },
  {
    id: "rightShift",
    label: "Right Shift",
    execute: rightShift,
    explanation:
      "Shifts all bits to the right by a specified number of positions. New bits on the left are filled with the sign bit (0 for positive, 1 for negative).",
  },
  {
    id: "unsignedRightShift",
    label: "Unsigned Right Shift",
    execute: unsignedRightShift,
    explanation:
      "Shifts all bits to the right by a specified number of positions. New bits on the left are always filled with 0s.",
  },
];
export const unaryOperationsList = unaryOperations.map((op) => op.id);
export const binaryOperationsList = binaryOprations.map((op) => op.id);

// all bitwise operations will be performed here
export function bitwiseNot(value: number): number {
  return ~value;
}

export function bitwiseAnd(value1: number, value2: number): number {
  return value1 & value2;
}

export function bitwiseOr(value1: number, value2: number): number {
  return value1 | value2;
}

export function bitwiseXor(value1: number, value2: number): number {
  return value1 ^ value2;
}

export function leftShift(value: number, shiftBy: number): number {
  return value << shiftBy;
}

export function rightShift(value: number, shiftBy: number): number {
  return value >> shiftBy;
}

export function unsignedRightShift(value: number, shiftBy: number): number {
  return value >>> shiftBy;
}
