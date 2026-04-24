export const coerceBoolean = (input: any): boolean | undefined => {
  if (input === undefined || input === null) return undefined;
  if (typeof input === "boolean") return input;
  if (typeof input === "number") {
    if (input === 1) return true;
    if (input === 0) return false;
    return undefined;
  }
  if (typeof input === "string") {
    const normalized = input.trim().toLowerCase();
    if (normalized === "true" || normalized === "1") return true;
    if (normalized === "false" || normalized === "0") return false;
    return undefined;
  }
  return undefined;
};

export const resolveBoolean = (input: any, fallback: boolean): boolean =>
  coerceBoolean(input) ?? fallback;

