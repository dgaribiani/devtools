import { formatTimestamp, parseTimestampInput } from './timestamp';

describe('timestamp utilities', () => {
  it('parses seconds timestamps into milliseconds', () => {
    const result = parseTimestampInput('1000');
    expect(result?.epochMs).toBe(1000 * 1000);
  });

  it('parses milliseconds timestamps', () => {
    const result = parseTimestampInput('1700000000000');
    expect(result?.epochMs).toBe(1700000000000);
  });

  it('formats timestamps into local and utc strings', () => {
    const formatted = formatTimestamp(0);
    expect(formatted.utc).toContain('1970');
  });
});
