export function isNil(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

export function isBlank(value: unknown): boolean {
  return typeof value === 'string' ? value.trim().length === 0 : isNil(value);
}
