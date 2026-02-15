export interface DiffOptions {
  ignorePaths?: string[];
  ignoreNullVsMissing?: boolean;
  numericTolerance?: number;
  arrayMatchKey?: { path: string; key: string } | null;
}

export interface DiffChange {
  type: 'added' | 'removed' | 'changed';
  path: string;
  before?: unknown;
  after?: unknown;
}

export interface DiffSummary {
  added: number;
  removed: number;
  changed: number;
  topPaths: string[];
}

export interface DiffResult {
  changes: DiffChange[];
  summary: DiffSummary;
}

export function diffJson(left: unknown, right: unknown, options: DiffOptions = {}): DiffResult {
  const changes: DiffChange[] = [];
  const ignoreMatchers = (options.ignorePaths ?? []).map(pattern => globToRegex(pattern));
  const arrayMatchKey = options.arrayMatchKey ?? null;

  const shouldIgnore = (path: string) => ignoreMatchers.some(regex => regex.test(path));
  const epsilon = options.numericTolerance ?? 0;

  const compare = (a: unknown, b: unknown, path: string): void => {
    if (shouldIgnore(path)) {
      return;
    }

    if (a === undefined && b === undefined) {
      return;
    }

    if (options.ignoreNullVsMissing) {
      const aMissing = a === undefined;
      const bMissing = b === undefined;
      if ((aMissing && b === null) || (bMissing && a === null)) {
        return;
      }
    }

    if (isPrimitive(a) && isPrimitive(b)) {
      if (typeof a === 'number' && typeof b === 'number') {
        if (Math.abs(a - b) <= epsilon) {
          return;
        }
      }
      if (a !== b) {
        changes.push({ type: 'changed', path, before: a, after: b });
      }
      return;
    }

    if (Array.isArray(a) || Array.isArray(b)) {
      if (!Array.isArray(a)) {
        changes.push({ type: 'changed', path, before: a, after: b });
        return;
      }
      if (!Array.isArray(b)) {
        changes.push({ type: 'changed', path, before: a, after: b });
        return;
      }

      if (arrayMatchKey && matchPath(path, arrayMatchKey.path)) {
        compareArrayByKey(a, b, path, arrayMatchKey.key, compare, changes);
        return;
      }

      const max = Math.max(a.length, b.length);
      for (let i = 0; i < max; i++) {
        const nextPath = `${path}[${i}]`;
        if (i >= a.length) {
          changes.push({ type: 'added', path: nextPath, after: b[i] });
        } else if (i >= b.length) {
          changes.push({ type: 'removed', path: nextPath, before: a[i] });
        } else {
          compare(a[i], b[i], nextPath);
        }
      }
      return;
    }

    if (isObject(a) && isObject(b)) {
      const leftKeys = Object.keys(a);
      const rightKeys = Object.keys(b);
      const keySet = new Set([...leftKeys, ...rightKeys]);
      for (const key of Array.from(keySet).sort()) {
        const nextPath = path === '$' ? `$.${key}` : `${path}.${key}`;
        if (!(key in a)) {
          changes.push({ type: 'added', path: nextPath, after: b[key] });
        } else if (!(key in b)) {
          changes.push({ type: 'removed', path: nextPath, before: a[key] });
        } else {
          compare(a[key], b[key], nextPath);
        }
      }
      return;
    }

    if (a !== b) {
      changes.push({ type: 'changed', path, before: a, after: b });
    }
  };

  compare(left, right, '$');

  const summary: DiffSummary = {
    added: changes.filter(change => change.type === 'added').length,
    removed: changes.filter(change => change.type === 'removed').length,
    changed: changes.filter(change => change.type === 'changed').length,
    topPaths: changes.slice(0, 6).map(change => change.path)
  };

  return { changes, summary };
}

function isPrimitive(value: unknown): boolean {
  return value === null || ['string', 'number', 'boolean'].includes(typeof value);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function globToRegex(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  const regex = `^${escaped.replace(/\*/g, '.*').replace(/\?/g, '.')}$`;
  return new RegExp(regex);
}

function matchPath(path: string, pattern: string): boolean {
  if (!pattern) {
    return false;
  }
  return globToRegex(pattern).test(path);
}

function compareArrayByKey(
  left: unknown[],
  right: unknown[],
  basePath: string,
  key: string,
  compare: (a: unknown, b: unknown, path: string) => void,
  changes: DiffChange[]
): void {
  const leftMap = new Map<string, unknown>();
  const rightMap = new Map<string, unknown>();

  left.forEach(item => {
    if (isObject(item) && item[key] !== undefined) {
      leftMap.set(String(item[key]), item);
    }
  });
  right.forEach(item => {
    if (isObject(item) && item[key] !== undefined) {
      rightMap.set(String(item[key]), item);
    }
  });

  const allKeys = new Set([...leftMap.keys(), ...rightMap.keys()]);
  for (const id of Array.from(allKeys).sort()) {
    const nextPath = `${basePath}[${key}=${id}]`;
    if (!leftMap.has(id)) {
      changes.push({ type: 'added', path: nextPath, after: rightMap.get(id) });
    } else if (!rightMap.has(id)) {
      changes.push({ type: 'removed', path: nextPath, before: leftMap.get(id) });
    } else {
      compare(leftMap.get(id), rightMap.get(id), nextPath);
    }
  }
}
