//core binary logic

export function toBinary32(value: number): string {
  // Implementation for converting to 32-bit binary
  return (value >>> 0).toString(2).padStart(32, "0");
}

export function splitIntoBytes(binary: string): string[] {
  // Implementation for grouping bits
  return binary.match(/.{8}/g) ?? [];
}

export function toSigned32(value: number): number {
  // Implementation for converting to signed 32-bit integer
  return value << 0;
}
