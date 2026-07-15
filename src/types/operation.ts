export type UnaryOperation = {
  id: string;
  label: string;
  execute: (value: number) => number;
  explanation: string;
};
export type BinaryOperation = {
  id: string;
  label: string;
  execute: (value1: number, value2: number) => number;
  explanation: string;
};
