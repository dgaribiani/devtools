import { canonicalizeJson } from './canonicalize';

describe('canonicalizeJson', () => {
  it('sorts keys recursively by default', () => {
    const input = { b: 1, a: { d: 2, c: 3 } };
    const output = canonicalizeJson(input) as Record<string, unknown>;
    expect(Object.keys(output)).toEqual(['a', 'b']);
    expect(Object.keys(output.a as Record<string, unknown>)).toEqual(['c', 'd']);
  });

  it('preserves array order by default', () => {
    const input = { items: [3, 1, 2] };
    const output = canonicalizeJson(input) as { items: number[] };
    expect(output.items).toEqual([3, 1, 2]);
  });

  it('can sort arrays when preserveArrayOrder is false', () => {
    const input = { items: [3, 1, 2] };
    const output = canonicalizeJson(input, { preserveArrayOrder: false }) as { items: number[] };
    expect(output.items).toEqual([1, 2, 3]);
  });
});
