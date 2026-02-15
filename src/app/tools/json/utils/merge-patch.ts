export function applyMergePatch(target: unknown, patch: unknown): unknown {
  if (!isObject(patch)) {
    return patch;
  }
  const result = isObject(target) ? { ...target } : {};
  Object.keys(patch).forEach(key => {
    const value = (patch as Record<string, unknown>)[key];
    if (value === null) {
      delete (result as Record<string, unknown>)[key];
      return;
    }
    if (isObject(value)) {
      const base = (result as Record<string, unknown>)[key];
      (result as Record<string, unknown>)[key] = applyMergePatch(base, value);
      return;
    }
    (result as Record<string, unknown>)[key] = value;
  });
  return result;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
