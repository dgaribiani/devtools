export interface WhitespaceOptions {
  lineEnding: 'preserve' | 'lf' | 'crlf';
  trimTrailing: boolean;
  trimLeading: boolean;
  trimLines: boolean;
  tabsToSpaces: boolean;
  tabSize: number;
}

export function normalizeWhitespace(input: string, options: WhitespaceOptions): string {
  let output = input ?? '';
  if (options.tabsToSpaces) {
    const size = Math.max(1, Math.min(8, options.tabSize || 2));
    output = output.replace(/\t/g, ' '.repeat(size));
  }

  let lines = output.split(/\r\n|\r|\n/);
  if (options.trimLines) {
    lines = lines.map(line => line.trim());
  } else {
    if (options.trimLeading) {
      lines = lines.map(line => line.replace(/^\s+/, ''));
    }
    if (options.trimTrailing) {
      lines = lines.map(line => line.replace(/\s+$/, ''));
    }
  }

  const joiner = options.lineEnding === 'preserve'
    ? detectLineEnding(input)
    : options.lineEnding === 'crlf'
      ? '\r\n'
      : '\n';

  return lines.join(joiner);
}

function detectLineEnding(input: string): string {
  const crlf = /\r\n/.test(input);
  if (crlf) {
    return '\r\n';
  }
  const lf = /\n/.test(input);
  return lf ? '\n' : '\n';
}
