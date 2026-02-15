export interface CanonicalizeOptions {
  sortKeys?: boolean;
  preserveArrayOrder?: boolean;
}

export function canonicalizeJson(value: unknown, options: CanonicalizeOptions = {}): unknown {
  const sortKeys = options.sortKeys !== false;
  const preserveArrayOrder = options.preserveArrayOrder !== false;

  if (Array.isArray(value)) {
    const mapped = value.map(item => canonicalizeJson(item, options));
    if (preserveArrayOrder) {
      return mapped;
    }
    return [...mapped].sort((a, b) => {
      const left = JSON.stringify(a);
      const right = JSON.stringify(b);
      return left.localeCompare(right);
    });
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const keys = Object.keys(record);
    if (sortKeys) {
      keys.sort();
    }
    const result: Record<string, unknown> = {};
    for (const key of keys) {
      result[key] = canonicalizeJson(record[key], options);
    }
    return result;
  }

  return value;
}
